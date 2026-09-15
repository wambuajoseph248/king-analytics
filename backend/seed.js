require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const services = [
    {
      name: "Data Analysis",
      description:
        "Professional data cleaning, analysis, visualization, statistical analysis and reporting.",
    },
    {
      name: "Project Writing",
      description:
        "Academic and professional project writing, proposals, reports and documentation.",
    },
    {
      name: "Research Services",
      description:
        "Research design, data collection, analysis, interpretation and research reporting.",
    },
    {
      name: "Database Management",
      description:
        "Database design, organization, maintenance, data management and reporting solutions.",
    },
    {
      name: "Business Analysis",
      description:
        "Business process analysis, requirements gathering, performance analysis and decision support.",
    },
    {
      name: "Data Visualization",
      description:
        "Interactive dashboards, charts and reports using modern data visualization tools.",
    },
    {
      name: "Statistical Consulting",
      description:
        "Statistical consulting, hypothesis testing, statistical modelling and interpretation.",
    },
    {
      name: "Business Intelligence",
      description:
        "Business intelligence solutions, KPI dashboards, reporting and data-driven insights.",
    },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: {
        name: service.name,
      },
      update: {
        description: service.description,
        active: true,
      },
      create: {
        name: service.name,
        description: service.description,
        active: true,
      },
    });
  }

  console.log("King Analytics services added successfully.");
}

main()
  .catch((error) => {
    console.error("SEED ERROR:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });