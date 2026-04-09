-- AlterEnum: Add LATE to AttendanceStatus
ALTER TYPE "AttendanceStatus" ADD VALUE 'LATE';

-- AlterTable: Add role assignment columns to SecretariatTask
ALTER TABLE "SecretariatTask" ADD COLUMN "assignedRoleId" TEXT;
ALTER TABLE "SecretariatTask" ADD COLUMN "assignedRoleName" TEXT;

-- AddForeignKey
ALTER TABLE "SecretariatTask" ADD CONSTRAINT "SecretariatTask_assignedRoleId_fkey" FOREIGN KEY ("assignedRoleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;
