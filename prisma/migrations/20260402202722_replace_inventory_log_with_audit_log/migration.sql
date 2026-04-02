-- DropTable
DROP TABLE "InventoryLog";

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetName" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuditLog_section_createdAt_idx" ON "AuditLog"("section", "createdAt" DESC);
