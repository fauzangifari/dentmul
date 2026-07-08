"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { UserFormDialog } from "@/features/admin/components/user-form-dialog";

export function CreateUserButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <UserPlus size={16} className="mr-1" /> Tambah User
      </Button>
      <UserFormDialog mode="create" open={open} onOpenChange={setOpen} />
    </>
  );
}
