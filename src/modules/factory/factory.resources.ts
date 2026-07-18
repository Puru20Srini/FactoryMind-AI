import { ResourceDecorator as Resource } from "@nitrostack/core";
import * as fs from "fs";
import * as path from "path";

export class FactoryResources {

  @Resource({
    uri: "factory://dashboard",
    name: "Factory Dashboard",
    description: "Live factory dashboard showing machine health and maintenance status."
  })
  async dashboard() {

    const machines = JSON.parse(
      fs.readFileSync(
        path.join(process.cwd(), "src/data/machines.json"),
        "utf8"
      )
    );

    const tickets = JSON.parse(
      fs.readFileSync(
        path.join(process.cwd(), "src/data/tickets.json"),
        "utf8"
      )
    );

    const technicians = JSON.parse(
      fs.readFileSync(
        path.join(process.cwd(), "src/data/technicians.json"),
        "utf8"
      )
    );

    const inventory = JSON.parse(
      fs.readFileSync(
        path.join(process.cwd(), "src/data/inventory.json"),
        "utf8"
      )
    );

    const healthy = machines.filter((m: any) => m.health >= 75).length;
    const warning = machines.filter(
      (m: any) => m.health >= 50 && m.health < 75
    ).length;
    const critical = machines.filter((m: any) => m.health < 50).length;

    const availableTechs = technicians.filter(
      (t: any) => t.available
    ).length;

    const lowStock = inventory.filter(
      (p: any) => p.stock < p.minimumStock
    );

    return {
      machines: machines.length,
      healthy,
      warning,
      critical,
      openTickets: tickets.length,
      availableTechnicians: availableTechs,
      lowStockParts: lowStock
    };
  }
}