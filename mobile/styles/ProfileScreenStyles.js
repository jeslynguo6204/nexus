// mobile/styles/ProfileScreenStyles.js
import { COLORS } from "./ProfileFormStyles";

const BUTTON_BORDER_RADIUS = 12;
const AVATAR_SIZE = 64;

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#F3F7FC',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 0, // Ensure bottom padding is set to 0
  },

  // Card styles
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  // Header styles
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 22, fontWeight: "800", color: COLORS.text,
  },
  subtitle: {
    fontSize: 13, color: "#6B7280",
  },
  iconButton: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "#EEF2FF",
    alignItems: "center", justifyContent: "center",
    marginLeft: 8,
  },

  // Profile styles
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  avatar: {
    width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2,
    backgroundColor: "#E1E8F5",
    marginRight: 12,
  },
  avatarImage: {
    width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2,
    marginRight: 12,
  },
  nameText: {
    fontSize: 20, fontWeight: "700", color: COLORS.text,
  },
  metaText: {
    fontSize: 14, color: "#6B7280", marginTop: 2,
  },

  // Button styles
  actionsRow: {
    flexDirection: "row",
    marginTop: 16,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BUTTON_BORDER_RADIUS,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF", fontWeight: "700", fontSize: 15,
  },
  secondaryButton: {
    borderRadius: BUTTON_BORDER_RADIUS,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  secondaryButtonText: {
    color: COLORS.text, fontWeight: "600", fontSize: 15,
  },

  // Section styles
  sectionHeader: {
    fontSize: 18, fontWeight: "700", color: COLORS.text, marginBottom: 6,
  },

  // Chip styles
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginVertical: 8,
    alignItems: "center",
    gap: 8,
  },
  chipRowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#FFFFFF",
  },
  chipText: {
    color: COLORS.text, fontSize: 14, fontWeight: "600",
  },
  addChip: {
    borderColor: COLORS.primary,
    backgroundColor: "#E9F4FF",
  },

  // Photo grid styles
  photoGrid: {
    paddingTop: 10,
    paddingBottom: 4,
  },
  photoRow: {
    gap: 12,
    paddingBottom: 12,
  },
  photoSlot: {
    width: 110,
    height: 110,
    borderRadius: 16,
    backgroundColor: "#E8EDF6",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  photoImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  photoSlotActive: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  addPhotoSlot: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: COLORS.primary,
    backgroundColor: "#E9F4FF",
  },
  photoPlaceholder: {
    fontSize: 32,
    color: "#9CA3AF",
    fontWeight: "700",
  },

  // Preview styles
  previewContainer: {
    flex: 1,
    backgroundColor: "#1F6299", // brand color
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#E5F2FF",
  },
  previewCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.1)",
  },
  previewBody: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 24,
    justifyContent: "center",
  },
};

export default styles;