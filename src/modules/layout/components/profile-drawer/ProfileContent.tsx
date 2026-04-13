"use client";

import React, { useState } from "react";
import MenuView from "./MenuView";
import LoginView from "./LoginView";
import SignupView from "./SignupView";
import ProfileView from "./ProfileView";

type ViewState = "menu" | "login" | "signup" | "profile"; // Tambah "profile"

interface ProfileContentProps {
  onClose: () => void;
}

export default function ProfileContent({ onClose }: ProfileContentProps) {
  const [view, setView] = useState<ViewState>("menu");

  if (view === "menu") return <MenuView onClose={onClose} setView={setView} />;
  if (view === "login") return <LoginView onClose={onClose} setView={setView} />;
  if (view === "signup") return <SignupView onClose={onClose} setView={setView} />;
  if (view === "profile") return <ProfileView onClose={onClose} setView={setView} />; // Tambah ini
  return null;
}