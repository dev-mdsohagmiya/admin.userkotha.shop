import { MediaImage } from "./media";

export interface IBlog {
  id: string;
  title: string;
  imageId?: string;
  slug: string; 
  shortDesc?: string;
  description?: string;
  isActive: boolean;
  image?: MediaImage;
  createdAt?: string;
  updatedAt?: string;
}
export interface TBlogCreateInput {
  title?: string;
  imageId?: string; 
  shortDesc?: string;
  description?: string;
  isActive?: boolean;
}

// model blog {
//   id          String   @id @default(cuid())
//   title       String
//   imageId     String?
//   shortDesc   String?
//   description String?
//   slug        String   @unique
//   isActive    Boolean  @default(true)
//   createdAt   DateTime @default(now()) @map("created_at")
//   updatedAt   DateTime @updatedAt @map("updated_at")
//   image       Media?   @relation(fields: [imageId], references: [id])

//   @@map("blogs")
// }
