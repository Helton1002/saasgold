import { QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.bulkInsert(
        "Plans",
        [
          {
            name: "Plano 1",
            users: 10,
            connections: 10,
            queues: 10,
            value: 30,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ],
        { transaction: t }
      );

      await queryInterface.bulkInsert(
        "Companies",
        [
          {
            name: "Empresa 1",
            planId: 1,
            dueDate: new Date("2093-03-14T03:00:00.000Z"), // formato ISO é mais seguro
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ],
        { transaction: t }
      );
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await Promise.all([
      queryInterface.bulkDelete("Companies", {}, {}),
      queryInterface.bulkDelete("Plans", {}, {})
    ]);
  }
};