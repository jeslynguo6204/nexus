import http from "http";
import { Server, Socket } from "socket.io";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import { config } from "../config/env";
import { findUserByEmail, createUserWithDefaults } from "../modules/users/users.dao";
import { resolveSchoolForEmail } from "../modules/schools/schools.service";
import { sendMessage as sendMessageService } from "../modules/messages/messages.service";
import { getMatchByIdForUser } from "../modules/matches/matches.dao";

type Mode = "romantic" | "platonic";

const cognitoVerifier = CognitoJwtVerifier.create({
  userPoolId: config.cognitoUserPoolId,
  tokenUse: "id",
  clientId: config.cognitoAppClientId,
});

const deriveNameFromEmail = (email: string) => {
  const base = email.split("@")[0] || "Student";
  const withSpaces = base.replace(/[._-]+/g, " ");
  return withSpaces.replace(/\b\w/g, (c) => c.toUpperCase());
};

async function getOrCreateUser(email: string) {
  let user = await findUserByEmail(email);
  if (!user) {
    const school = await resolveSchoolForEmail(email);
    const fullName = deriveNameFromEmail(email);
    const userId = await createUserWithDefaults({
      schoolId: school?.id ?? null,
      email,
      passwordHash: null,
      fullName,
      dateOfBirth: null,
      gender: null,
      phoneNumber: null,
    });
    user = {
      id: userId,
      email,
      password_hash: null,
      full_name: fullName,
      school_id: school?.id ?? null,
    };
  }
  return user;
}

async function verifyToken(token: string) {
  const payload = await cognitoVerifier.verify(token);
  const email = typeof payload.email === "string" ? payload.email : null;
  if (!email) throw new Error("Token missing email");
  return { email };
}

function roomForChat(chatId: number) {
  return `chat:${chatId}`;
}

function roomForMatch(matchId: number) {
  return `match:${matchId}`;
}

export function initSocketServer(server: http.Server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.use(async (socket, next) => {
    try {
      const token =
        (socket.handshake.auth as any)?.token ||
        (socket.handshake.query?.token as string | undefined);
      if (!token) {
        return next(new Error("Unauthorized"));
      }
      const { email } = await verifyToken(token);
      const user = await getOrCreateUser(email);
      (socket.data as any).userId = user.id;
      (socket.data as any).email = email;
      next();
    } catch (err: any) {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const userId: number = (socket.data as any).userId;

    socket.on(
      "join_chat",
      async (
        payload: { matchId: number; mode?: Mode },
        callback?: (resp: { ok: boolean; chatId?: number; room?: string; error?: string }) => void
      ) => {
        try {
          const mode: Mode = payload.mode || "romantic";
          const matchId = Number(payload.matchId);
          if (Number.isNaN(matchId)) throw new Error("Invalid matchId");

          const match = await getMatchByIdForUser(matchId, userId, mode);
          if (!match) throw new Error("Match not found");

          const room = match.chat_id
            ? roomForChat(match.chat_id)
            : roomForMatch(matchId);
          socket.join(room);
          callback?.({ ok: true, chatId: match.chat_id ?? undefined, room });
        } catch (error: any) {
          callback?.({ ok: false, error: error.message || "Join failed" });
        }
      }
    );

    socket.on(
      "send_message",
      async (
        payload: { matchId: number; body: string; mode?: Mode },
        callback?: (resp: { ok: boolean; chatId?: number; message?: any; error?: string }) => void
      ) => {
        try {
          const mode: Mode = payload.mode || "romantic";
          const matchId = Number(payload.matchId);
          if (Number.isNaN(matchId)) throw new Error("Invalid matchId");
          const body = (payload.body || "").trim();
          if (!body) throw new Error("Message body cannot be empty");

          const result = await sendMessageService(matchId, userId, body, mode);
          const { chatId, message } = result;

          const messagePayload = {
            ...message,
            match_id: matchId,
            mode,
          };

          const chatRoom = roomForChat(chatId);
          const matchRoom = roomForMatch(matchId);

          // Ensure sender is in the chat room
          socket.join(chatRoom);
          // Sender might still be in the match room from pre-chat phase; that's fine, but we avoid double-emitting.

          // Emit to chat room (all participants who have an active chat)
          io.to(chatRoom).emit("message", messagePayload);

          // If there are listeners still sitting in the match room (pre-chat state), emit once there too
          // but skip the sender to prevent duplicate delivery to self.
          socket.to(matchRoom).emit("message", messagePayload);

          callback?.({ ok: true, chatId, message: messagePayload });
        } catch (error: any) {
          callback?.({ ok: false, error: error.message || "Send failed" });
        }
      }
    );
  });

  return io;
}
