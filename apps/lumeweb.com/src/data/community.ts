import { z } from "zod";
import communityDataRaw from "./community.json";

export const CommunityProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  features: z.array(z.string()),
  links: z.array(
    z.object({
      text: z.string(),
      url: z.string(),
      style: z.enum(["primary", "secondary"]),
    })
  ),
});

export const CommunityDataSchema = z.object({
  projects: z.array(CommunityProjectSchema),
});

export type CommunityProject = z.infer<typeof CommunityProjectSchema>;

// Validate and export data
const parsedResult = CommunityDataSchema.safeParse(communityDataRaw as unknown);

export const communityProjects: CommunityProject[] = parsedResult.success ? parsedResult.data.projects : [];

if (!parsedResult.success) {
  console.error('Invalid community data:', parsedResult.error);
}