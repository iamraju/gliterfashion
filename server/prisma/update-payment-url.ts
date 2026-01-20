import "dotenv/config";
import prisma from "../src/database/client";

async function main() {
  console.log("🔄 Updating Payment URLs...");

  // Update Success URL
  await prisma.setting.upsert({
    where: { key: "ESEWA_SUCCESS_URL" },
    update: { value: "http://localhost:5173/checkout/esewa/success" },
    create: {
      key: "ESEWA_SUCCESS_URL",
      value: "http://localhost:5173/checkout/esewa/success",
      group: "PAYMENT",
      label: "eSewa Success URL",
      type: "text"
    }
  });

  // Update Failure URL
  await prisma.setting.upsert({
    where: { key: "ESEWA_FAILURE_URL" },
    update: { value: "http://localhost:5173/checkout/esewa/failure" },
    create: {
      key: "ESEWA_FAILURE_URL",
      value: "http://localhost:5173/checkout/esewa/failure",
      group: "PAYMENT",
      label: "eSewa Failure URL",
      type: "text"
    }
  });

  console.log("✅ Payment URLs updated to localhost:5173");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
