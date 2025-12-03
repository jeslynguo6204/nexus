import { dbQuery } from "../../db/pool";

export interface School {
  id: number;
  name: string;
  domain: string;
}

export async function findSchoolByDomain(domain: string): Promise<School | null> {
  const rows = await dbQuery<School>(
    "SELECT id, name, domain FROM schools WHERE domain = $1",
    [domain]
  );
  return rows[0] ?? null;
}