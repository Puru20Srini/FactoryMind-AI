import fs from 'fs';
import path from 'path';

export class MachineService {
  private machines = JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), 'src/data/machines.json'),
      'utf-8'
    )
  );

  getAllMachines() {
    return this.machines;
  }

  getMachineById(id: string) {
    return this.machines.find((m: any) => m.id === id);
  }
}