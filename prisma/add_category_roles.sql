CREATE TABLE IF NOT EXISTS "_InventoryCategoryRoles" (
  "A" TEXT NOT NULL,
  "B" TEXT NOT NULL,
  CONSTRAINT "_InventoryCategoryRoles_AB_pkey" PRIMARY KEY ("A","B"),
  CONSTRAINT "_InventoryCategoryRoles_A_fkey" FOREIGN KEY ("A") REFERENCES "InventoryCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "_InventoryCategoryRoles_B_fkey" FOREIGN KEY ("B") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "_InventoryCategoryRoles_B_index" ON "_InventoryCategoryRoles"("B");
