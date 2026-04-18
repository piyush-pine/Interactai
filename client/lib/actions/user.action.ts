"use server";

import { db } from "@/firebase/admin";
import { revalidatePath } from "next/cache";

export interface UpdateUserProfileParams {
  userId: string;
  name?: string;
  resumeURL?: string;
  resumeName?: string;
  bio?: string;
  linkedIn?: string;
  github?: string;
  skills?: string[];
}

export async function updateUserProfile(params: UpdateUserProfileParams) {
  const { userId, name, resumeURL, resumeName, bio, linkedIn, github, skills } = params;

  try {
    const updateData: Partial<UpdateUserProfileParams> = {};
    if (name) updateData.name = name;
    if (resumeURL) updateData.resumeURL = resumeURL;
    if (resumeName) updateData.resumeName = resumeName;
    if (bio !== undefined) updateData.bio = bio;
    if (linkedIn !== undefined) updateData.linkedIn = linkedIn;
    if (github !== undefined) updateData.github = github;
    if (skills !== undefined) updateData.skills = skills;

    await db.collection("users").doc(userId).update(updateData);

    revalidatePath("/profile");
    revalidatePath("/");

    return {
      success: true,
      message: "Profile updated successfully.",
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error updating user profile:", errorMessage);
    return {
      success: false,
      message: "Failed to update profile. Please try again.",
    };
  }
}
