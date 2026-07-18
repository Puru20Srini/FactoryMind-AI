import {
  ToolDecorator as Tool,
  Widget,
  ExecutionContext,
  z
} from '@nitrostack/core';
import * as fs from 'fs';
import * as path from 'path';

export class FactoryTools {
  @Tool({
  name: 'predict_machine_failure',
  description: 'Predict machine failure based on health metrics.',
  inputSchema: z.object({
    machineId: z.string().describe('Machine ID (e.g. M-101)')
  })
})
async predictMachineFailure(input: any, ctx: ExecutionContext) {

  ctx.logger.info('Predicting machine failure', {
    machineId: input.machineId
  });

  const machines = JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), 'src/data/machines.json'),
      'utf8'
    )
  );

  const machine = machines.find(
    (m: any) => m.id === input.machineId
  );

  if (!machine) {
    return {
      status: "error",
      message: "Machine not found"
    };
  }

  let score = 0;
  const reasons: string[] = [];

  if (machine.temperature > 80) {
    score += 30;
    reasons.push("High temperature");
  }

  if (machine.vibration > 6) {
    score += 35;
    reasons.push("High vibration");
  }

  if (machine.health < 75) {
    score += 35;
    reasons.push("Low health score");
  }

  let risk = "LOW";

  if (score >= 70) {
    risk = "HIGH";
  } else if (score >= 40) {
    risk = "MEDIUM";
  }
  let recommendation = "";

  if (risk === "HIGH") {
    recommendation =
      "🚨 Stop the machine immediately. Assign the technician, replace the faulty component, and complete maintenance before restarting.";
  } else if (risk === "MEDIUM") {
    recommendation =
      "⚠️ Schedule maintenance within the next maintenance window and monitor machine parameters closely.";
  } else {
    recommendation =
      "✅ Machine is operating normally. Continue routine monitoring.";
  }
  return {
    status: "success",
    machineId: machine.id,
    machineName: machine.name,
    failureProbability: score,
    risk,
    reasons,
    recommendation
  };
}

  @Tool({
    name: 'get_machine_health',
    description: 'Get the health status of a machine by its ID.',
    inputSchema: z.object({
      machineId: z.string().describe('Machine ID (e.g. M-101)')
    })
  })
  async getMachineHealth(input: any, ctx: ExecutionContext) {

    ctx.logger.info('Checking machine', {
      machineId: input.machineId
    });

    const machines = JSON.parse(
      fs.readFileSync(
        path.join(process.cwd(), 'src/data/machines.json'),
        'utf8'
      )
    );

    const machine = machines.find(
      (m: any) => m.id === input.machineId
    );

    if (!machine) {
      return {
        status: "error",
        message: "Machine not found"
      };
    }

    return {
      status: "success",
      machine
    };
  }
  @Tool({
  name: 'get_maintenance_history',
  description: 'Get maintenance history of a machine.',
  inputSchema: z.object({
    machineId: z.string()
  })
})
async getMaintenanceHistory(input: any, ctx: ExecutionContext) {

  ctx.logger.info('Loading maintenance history', {
    machineId: input.machineId
  });

  const history = JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), 'src/data/maintenance.json'),
      'utf8'
    )
  );

  const record = history.find(
    (m: any) => m.machineId === input.machineId
  );

  if (!record) {
    return {
      status: "error",
      message: "No maintenance history found."
    };
  }

  return {
    status: "success",
    maintenance: record
  };

}
@Tool({
  name: "check_inventory",
  description: "Check inventory availability for a spare part.",
  inputSchema: z.object({
    partName: z.string().describe("Name of the spare part")
  })
})
async checkInventory(input: any, ctx: ExecutionContext) {

  ctx.logger.info("Checking inventory", {
    partName: input.partName
  });

  const inventory = JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), "src/data/inventory.json"),
      "utf8"
    )
  );

  const part = inventory.find(
    (p: any) =>
      p.partName.toLowerCase() === input.partName.toLowerCase()
  );

  if (!part) {
    return {
      status: "error",
      message: "Part not found."
    };
  }

  return {
    status: "success",
    partName: part.partName,
    stock: part.stock,
    minimumStock: part.minimumStock,
    warehouse: part.warehouse,
    available: part.stock > 0,
    reorderRequired: part.stock < part.minimumStock
  };
}
@Tool({
  name: "assign_technician",
  description: "Assign an available technician based on specialization.",
  inputSchema: z.object({
    specialization: z.string().describe("Required technician specialization")
  })
})
async assignTechnician(input: any, ctx: ExecutionContext) {

  ctx.logger.info("Assigning technician", {
    specialization: input.specialization
  });

  const technicians = JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), "src/data/technicians.json"),
      "utf8"
    )
  );

  const technician = technicians.find(
    (t: any) =>
      t.specialization.toLowerCase() === input.specialization.toLowerCase() &&
      t.available
  );

  if (!technician) {
    return {
      status: "error",
      message: "No available technician found."
    };
  }

  return {
    status: "success",
    technician
  };
}
@Tool({
  name: "create_maintenance_ticket",
  description: "Create a maintenance ticket for a machine.",
  inputSchema: z.object({
    machineId: z.string(),
    issue: z.string(),
    technician: z.string()
  })
})
async createMaintenanceTicket(input: any, ctx: ExecutionContext) {

  ctx.logger.info("Creating maintenance ticket", input);

  const ticket = {
    ticketId: "TICKET-" + Date.now(),
    machineId: input.machineId,
    issue: input.issue,
    technician: input.technician,
    status: "OPEN",
    createdAt: new Date().toISOString()
  };

  const filePath = path.join(
    process.cwd(),
    "src/data/tickets.json"
  );
  console.log("Ticket File Path:", filePath);

let tickets: any[] = [];

if (fs.existsSync(filePath)) {
  const content = fs.readFileSync(filePath, "utf8").trim();

  if (content) {
    try {
      tickets = JSON.parse(content);
    } catch (err) {
      tickets = [];
    }
  }
}

  tickets.push(ticket);

  fs.writeFileSync(
    filePath,
    JSON.stringify(tickets, null, 2)
  );

  return {
    status: "success",
    message: "Maintenance ticket created successfully.",
    ticket
  };
}
@Tool({
  name: "analyze_machine",
  description: "Perform a complete analysis of a machine and recommend maintenance actions.",
  inputSchema: z.object({
    machineId: z.string().describe("Machine ID (e.g. M-102)")
  })
})
async analyzeMachine(input: any, ctx: ExecutionContext) {

  const machineId = input.machineId;

  // Load all data
  const machines = JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), "src/data/machines.json"),
      "utf8"
    )
  );

  const maintenance = JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), "src/data/maintenance.json"),
      "utf8"
    )
  );

  const inventory = JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), "src/data/inventory.json"),
      "utf8"
    )
  );

  const technicians = JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), "src/data/technicians.json"),
      "utf8"
    )
  );

  const machine = machines.find((m:any)=>m.id===machineId);

  if(!machine){
    return {
      status:"error",
      message:"Machine not found."
    };
  }

  const history = maintenance.find((m:any)=>m.machineId===machineId);

  // -------- Failure Prediction --------

  let score = 0;
  let reasons:string[] = [];

  if(machine.temperature>80){
      score+=30;
      reasons.push("High temperature");
  }

  if(machine.vibration>6){
      score+=35;
      reasons.push("High vibration");
  }

  if(machine.health<75){
      score+=35;
      reasons.push("Low health score");
  }

  let risk="LOW";

  if(score>=70) risk="HIGH";
  else if(score>=40) risk="MEDIUM";

  // -------- Determine Required Part --------

  let requiredPart="General Inspection";

  if(history?.lastIssue==="Bearing Wear")
      requiredPart="Bearing";

  else if(history?.lastIssue==="Motor Overheating")
      requiredPart="Motor";

  else if(history?.lastIssue==="Hydraulic Leak")
      requiredPart="Hydraulic Oil";

  const part = inventory.find(
      (p:any)=>p.partName===requiredPart
  );

  // -------- Technician --------

  let specialization="Mechanical";

  if(requiredPart==="Motor")
      specialization="Electrical";

  if(requiredPart==="Hydraulic Oil")
      specialization="Hydraulic";

  const technician = technicians.find(
      (t:any)=>
      t.specialization===specialization &&
      t.available
  );
  let severity = "🟢 LOW";
  let priority = "P3";
  let estimatedDowntime = "30 Minutes";
  let estimatedRepairCost = "₹2,000";

  if (risk === "MEDIUM") {
    severity = "🟠 MEDIUM";
    priority = "P2";
    estimatedDowntime = "1 Hour";
    estimatedRepairCost = "₹8,000";
  }

  if (risk === "HIGH") {
    severity = "🔴 HIGH";
    priority = "P1";
    estimatedDowntime = "2 Hours";
    estimatedRepairCost = "₹18,000";
  }

  let recommendation = "";

  if (risk === "HIGH") {
    recommendation =
      "🚨 Stop the machine immediately and begin maintenance.";
  } else if (risk === "MEDIUM") {
    recommendation =
      "⚠️ Schedule maintenance soon and closely monitor the machine.";
  } else {
    recommendation =
      "✅ Machine is operating normally.";
  }

  const report = `
🏭 FactoryMind AI Analysis

Machine: ${machine.name} (${machine.id})

📊 Health
• Health Score: ${machine.health}%
• Temperature: ${machine.temperature}°C
• Vibration: ${machine.vibration} mm/s
• RPM: ${machine.rpm}

⚠️ Failure Prediction
• Risk: ${risk}
• Probability: ${score}%

Reasons:
${reasons.map(r => `- ${r}`).join("\n")}

• Status: ${history?.maintenanceStatus ?? "Unknown"}
• Previous Failures: ${history?.previousFailures ?? 0}
• Last Issue: ${history?.lastIssue ?? "N/A"}

📦 Inventory
• Part: ${part?.partName ?? "Unknown"}
• Stock: ${part?.stock ?? 0}

👨‍🔧 Technician
• ${technician?.name ?? "Not Available"}
(${technician?.specialization ?? "N/A"})

✅ Recommendation
${recommendation}

    🚦 Severity
    • ${severity}

    🎯 Priority
    • ${priority}

    ⏳ Estimated Downtime
    • ${estimatedDowntime}

    💰 Estimated Repair Cost
    • ${estimatedRepairCost}
`;

return {
  status: "success",
  report,
  severity,
  priority,
  estimatedDowntime,
  estimatedRepairCost,
  recommendation,
  machine,
  prediction: {
    probability: score,
    risk,
    reasons
  },
  maintenance: history,
  inventory: part,
  technician
};
}
@Tool({
  name: "root_cause_analysis",
  description: "Perform AI root cause analysis for a machine.",
  inputSchema: z.object({
    machineId: z.string().describe("Machine ID (e.g. M-102)")
  })
})
async rootCauseAnalysis(input: any, ctx: ExecutionContext) {

  ctx.logger.info("Running Root Cause Analysis", {
    machineId: input.machineId
  });

  const machines = JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), "src/data/machines.json"),
      "utf8"
    )
  );

  const maintenance = JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), "src/data/maintenance.json"),
      "utf8"
    )
  );

  const machine = machines.find(
    (m: any) => m.id === input.machineId
  );

  if (!machine) {
    return {
      status: "error",
      message: "Machine not found."
    };
  }

  const history = maintenance.find(
    (m: any) => m.machineId === input.machineId
  );

  const rootCause = history?.lastIssue ?? "Unknown";

  let chain: string[] = [];
  let actions: string[] = [];

  switch (rootCause) {

    case "Bearing Wear":
      chain = [
        "Bearing Wear",
        "Increased Friction",
        "Temperature Increased",
        "Vibration Increased",
        "Machine Health Reduced",
        "Failure Risk HIGH"
      ];

      actions = [
        "Stop the machine immediately",
        "Replace the bearing",
        "Lubricate moving components",
        "Inspect motor alignment",
        "Restart after successful testing"
      ];
      break;

    case "Motor Overheating":
      chain = [
        "Motor Overheating",
        "Excess Heat",
        "Reduced Efficiency",
        "Power Loss",
        "Failure Risk HIGH"
      ];

      actions = [
        "Inspect cooling system",
        "Check motor windings",
        "Replace damaged motor if required"
      ];
      break;

    case "Hydraulic Leak":
      chain = [
        "Hydraulic Leak",
        "Pressure Loss",
        "Reduced Force",
        "Machine Performance Drop",
        "Failure Risk HIGH"
      ];

      actions = [
        "Replace hydraulic seal",
        "Refill hydraulic oil",
        "Pressure test system"
      ];
      break;

    default:
      chain = [
        "General Mechanical Issue",
        "Performance Degradation",
        "Inspection Required"
      ];

      actions = [
        "Perform complete inspection"
      ];
  }

  const report = `
🔍 Root Cause Analysis

Machine
${machine.name} (${machine.id})

━━━━━━━━━━━━━━━━━━━━━━

Root Cause

${chain.join("\n↓\n")}

━━━━━━━━━━━━━━━━━━━━━━

Evidence

• Temperature : ${machine.temperature}°C
• Vibration : ${machine.vibration} mm/s
• Health : ${machine.health}%

━━━━━━━━━━━━━━━━━━━━━━

Previous Issue

${rootCause}

Previous Failures

${history?.previousFailures ?? 0}

━━━━━━━━━━━━━━━━━━━━━━

Recommended Actions

${actions.map(a => `✔ ${a}`).join("\n")}

━━━━━━━━━━━━━━━━━━━━━━

AI Conclusion

The primary cause of failure is "${rootCause}".
Immediate maintenance is recommended to avoid unplanned downtime.
`;

  return {
    status: "success",
    machine,
    rootCause,
    causeChain: chain,
    actions,
    report
  };
}
@Tool({
  name: "get_production_status",
  description: "Get the production status, efficiency, OEE, and AI summary for all production lines.",
  inputSchema: z.object({}),
  examples: {
  request: {},
  response: {
    totalLines: 3,
    running: 2,
    maintenance: 1,
    averageEfficiency: "82.3%",
    averageOEE: "78.7%",
    bottleneck: {
      line: "Line B",
      efficiency: 58
    },
    production: []
  }
}
  
})
@Widget("factory-dashboard")
async getProductionStatus(input: {}, ctx: ExecutionContext) {

  ctx.logger.info("Loading production dashboard");

  const production = JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), "src/data/production.json"),
      "utf8"
    )
  );

  const totalLines = production.length;

  const running = production.filter((l: any) => l.status === "Running").length;
  const maintenance = production.filter((l: any) => l.status === "Maintenance").length;

  const avgEfficiency = (
    production.reduce((s: number, l: any) => s + l.efficiency, 0) / totalLines
  ).toFixed(1);

  const avgOEE = (
    production.reduce((s: number, l: any) => s + l.oee, 0) / totalLines
  ).toFixed(1);

  const bottleneck = production.reduce((a: any, b: any) =>
    a.efficiency < b.efficiency ? a : b
  );

  const report = `
🏭 Factory Production Dashboard

━━━━━━━━━━━━━━━━━━━━━━

📊 Total Lines : ${totalLines}

🟢 Running : ${running}

🟠 Maintenance : ${maintenance}

⚡ Average Efficiency : ${avgEfficiency}%

🏭 Average OEE : ${avgOEE}%

━━━━━━━━━━━━━━━━━━━━━━

Production Lines

${production.map((line: any) => `
${line.line}
Status      : ${line.status}
Output      : ${line.output}/${line.target}
Efficiency  : ${line.efficiency}%
OEE         : ${line.oee}%
Machines    : ${line.machineCount}
`).join("\n")}

━━━━━━━━━━━━━━━━━━━━━━

⚠ Bottleneck

${bottleneck.line}
Efficiency : ${bottleneck.efficiency}%

━━━━━━━━━━━━━━━━━━━━━━

🤖 AI Recommendation

${
maintenance > 0
? `Restore ${maintenance} maintenance line(s) to improve factory throughput.`
: "All production lines are operating normally."
}
`;

  return {
    status: "success",
    totalLines,
    running,
    maintenance,
    averageEfficiency: `${avgEfficiency}%`,
    averageOEE: `${avgOEE}%`,
    bottleneck,
    production,
    report,
    generatedAt: new Date().toISOString()
  };
}
@Tool({
  name: "emergency_response",
  description: "Perform emergency response for a critical machine.",
  inputSchema: z.object({
    machineId: z.string().describe("Machine ID (e.g. M-102)")
  })
})
async emergencyResponse(input: any, ctx: ExecutionContext) {

  const machineId = input.machineId;

  ctx.logger.info("Running Emergency Response", {
    machineId
  });

  const analysis = await this.analyzeMachine(
    { machineId },
    ctx
  );

  if (analysis.status === "error") {
    return analysis;
  }

  // Determine required spare part
  let partName = "General Inspection";

  if (analysis.maintenance?.lastIssue === "Bearing Wear") {
    partName = "Bearing";
  } else if (analysis.maintenance?.lastIssue === "Motor Overheating") {
    partName = "Motor";
  } else if (analysis.maintenance?.lastIssue === "Hydraulic Leak") {
    partName = "Hydraulic Oil";
  }

  // Check inventory
  const inventory = await this.checkInventory(
    { partName },
    ctx
  );

  // Determine technician specialization
let specialization = "Mechanical";

if (partName === "Motor") {
  specialization = "Electrical";
} else if (partName === "Hydraulic Oil") {
  specialization = "Hydraulic";
}

// Assign technician
const technician = await this.assignTechnician(
  { specialization },
  ctx
);

// Create maintenance ticket if risk is HIGH
let ticket: any = null;

if (analysis.prediction?.risk === "HIGH") {

  ticket = await this.createMaintenanceTicket(
    {
      machineId,
      issue: analysis.maintenance?.lastIssue ?? "General Inspection",
      technician: technician.technician?.name ?? "Unassigned"
    },
    ctx
  );

}
return {
  status: "success",
  emergency: true,
  machine: analysis.machine,
  risk: analysis.prediction?.risk,
  inventory,
  technician,
  ticket,
  report: `
🚨 AI Emergency Response

━━━━━━━━━━━━━━━━━━━━━━

🏭 Machine
${analysis.machine.name} (${analysis.machine.id})

⚠️ Risk Level
${analysis.prediction?.risk}

📦 Spare Part
${partName}

${inventory.status === "success" ? "✅ Available" : "❌ Not Available"}

👨‍🔧 Technician
${technician.status === "success"
  ? technician.technician.name
  : "Not Available"}

🎫 Maintenance Ticket
${ticket?.status === "success"
  ? ticket.ticket.ticketId
  : "Not Created"}

🚨 Recommendation

Immediately stop the machine and perform maintenance before restarting operations.
`
};
}
@Widget("executive-dashboard")

@Tool({
  name: "executive_dashboard",
  description: "Show executive KPI dashboard.",
  inputSchema: z.object({})
})
async executiveDashboard(input: {}, ctx: ExecutionContext) {

  ctx.logger.info("Loading Executive Dashboard");

  const machines = JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), "src/data/machines.json"),
      "utf8"
    )
  );

  const production = JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), "src/data/production.json"),
      "utf8"
    )
  );

  const tickets = JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), "src/data/tickets.json"),
      "utf8"
    )
  );
  // Machine KPIs
const healthyMachines = machines.filter((m: any) => m.health >= 80).length;

const warningMachines = machines.filter(
  (m: any) => m.health >= 60 && m.health < 80
).length;

const criticalMachines = machines.filter(
  (m: any) => m.health < 60
).length;

// Production KPIs
const totalLines = production.length;

const averageEfficiency = (
  production.reduce((sum: number, p: any) => sum + p.efficiency, 0) /
  totalLines
).toFixed(1);

const averageOEE = (
  production.reduce((sum: number, p: any) => sum + p.oee, 0) /
  totalLines
).toFixed(1);

// Maintenance KPIs
const openTickets = tickets.filter(
  (t: any) => t.status === "OPEN"
).length;

// Highest Priority Machine
const highestPriorityMachine = machines.reduce((a: any, b: any) =>
  a.health < b.health ? a : b
);

return {
  status: "success",
  report: "Executive dashboard is working.",
  healthyMachines,
  warningMachines,
  criticalMachines,
  openTickets,
  averageEfficiency,
  averageOEE,
  highestPriorityMachine
};

}
@Tool({
  name: "factory_manager",
  description: "AI Factory Manager that prioritizes machines for maintenance.",
  inputSchema: z.object({})
})
async factoryManager(input: {}, ctx: ExecutionContext) {

  ctx.logger.info("Running AI Factory Manager");

  const machines = JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), "src/data/machines.json"),
      "utf8"
    )
  );

  const maintenance = JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), "src/data/maintenance.json"),
      "utf8"
    )
  );

  const production = JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), "src/data/production.json"),
      "utf8"
    )
  );

  const priorities = machines.map((machine: any) => {

  let score = 0;

  if (machine.health < 75) score += 40;
  if (machine.temperature > 80) score += 30;
  if (machine.vibration > 6) score += 30;

  const history = maintenance.find(
    (m: any) => m.machineId === machine.id
  );

  return {
    machineId: machine.id,
    machineName: machine.name,
    health: machine.health,
    score,
    issue: history?.lastIssue ?? "Unknown"
  };

});

priorities.sort((a: any, b: any) => b.score - a.score);

const topMachine = priorities[0];

let recommendation = "";

if (topMachine.score >= 70) {

  recommendation =
    `Immediately repair ${topMachine.machineId}. High risk of failure.`;

} else if (topMachine.score >= 40) {

  recommendation =
    `Schedule maintenance for ${topMachine.machineId} today.`;

} else {

  recommendation =
    "Factory is operating normally.";

}

const report = `
🤖 AI Factory Manager

━━━━━━━━━━━━━━━━━━━━━━

🎯 Highest Priority

Machine : ${topMachine.machineName}
ID      : ${topMachine.machineId}

Health  : ${topMachine.health}%

Risk Score : ${topMachine.score}

Issue : ${topMachine.issue}

━━━━━━━━━━━━━━━━━━━━━━

🏆 Maintenance Priority

${priorities
  .map(
    (m: any, i: number) =>
      `${i + 1}. ${m.machineId} (${m.score})`
  )
  .join("\n")}

━━━━━━━━━━━━━━━━━━━━━━

📢 Recommendation

${recommendation}
`;

return {
  status: "success",
  topMachine,
  priorities,
  recommendation,
  report
};
}
@Tool({
  name: "business_impact",
  description: "Estimate the business impact of a machine failure.",
  inputSchema: z.object({
    machineId: z.string().describe("Machine ID (e.g. M-102)")
  })
})
async businessImpact(input: any, ctx: ExecutionContext) {

  ctx.logger.info("Calculating Business Impact", {
    machineId: input.machineId
  });

  // Perform AI machine analysis
  const analysis = await this.analyzeMachine(
    { machineId: input.machineId },
    ctx
  );

  if (analysis.status === "error") {
    return analysis;
  }

  // Safety check
  if (!analysis.prediction || !analysis.machine) {
    return {
      status: "error",
      message: "Unable to calculate business impact."
    };
  }

  // Default values
  let downtimeHours = 1;
  let maintenanceCost = 5000;

  if (analysis.prediction.risk === "MEDIUM") {
    downtimeHours = 1;
    maintenanceCost = 8000;
  }

  if (analysis.prediction.risk === "HIGH") {
    downtimeHours = 2;
    maintenanceCost = 18000;
  }

  // Business assumptions
  const productionPerHour = 120;
  const unitPrice = 400;

  const productionLoss =
    downtimeHours * productionPerHour;

  const revenueLoss =
    productionLoss * unitPrice;

  const totalImpact =
    revenueLoss + maintenanceCost;

  const hourlyLoss =
    productionPerHour * unitPrice;

  let recommendation = "";

  if (analysis.prediction.risk === "HIGH") {
    recommendation =
      "Immediately stop the machine and begin maintenance to minimize production loss.";
  } else if (analysis.prediction.risk === "MEDIUM") {
    recommendation =
      "Schedule maintenance during the next production window.";
  } else {
    recommendation =
      "Machine is operating normally. Continue monitoring.";
  }

  const report = `
💰 Business Impact Analysis

━━━━━━━━━━━━━━━━━━━━━━

🏭 Machine

${analysis.machine.name} (${analysis.machine.id})

━━━━━━━━━━━━━━━━━━━━━━

⏱ Estimated Downtime

${downtimeHours} Hour(s)

📦 Production Loss

${productionLoss} Units

💰 Revenue Loss

₹${revenueLoss.toLocaleString()}

🔧 Maintenance Cost

₹${maintenanceCost.toLocaleString()}

💸 Total Business Impact

₹${totalImpact.toLocaleString()}

━━━━━━━━━━━━━━━━━━━━━━

🤖 AI Recommendation

${recommendation}

Every additional hour of downtime
will cost approximately
₹${hourlyLoss.toLocaleString()}.
`;

  return {
  status: "success",
  machine: analysis.machine,
  risk: analysis.prediction.risk,
  downtimeHours,
  productionLoss,
  revenueLoss,
  maintenanceCost,
  totalImpact,
  hourlyLoss,
  recommendation,
  report,
  generatedAt: new Date().toISOString()
};
}
}