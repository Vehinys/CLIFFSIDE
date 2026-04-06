"use client";

import { Button } from "@/components/ui/button";

// Ces composants permettent d'appeler les handlers des listes depuis la page serveur.
// Ils utilisent un event custom pour déclencher l'ouverture de la modal.

export function NewNoteButton() {
  return (
    <Button onClick={() => window.dispatchEvent(new CustomEvent("notes:create"))}>
      + Nouvelle note
    </Button>
  );
}

export function NewAnnouncementButton() {
  return (
    <Button onClick={() => window.dispatchEvent(new CustomEvent("announcements:create"))}>
      + Nouvelle annonce
    </Button>
  );
}

export function NewReportButton() {
  return (
    <Button onClick={() => window.dispatchEvent(new CustomEvent("reports:create"))}>
      + Nouveau compte-rendu
    </Button>
  );
}
