export interface Command {
  id: number;
  name: string;
  voice: string;
  script: string;
  params: string;
  createdAt: Date;
  updatedAt: Date;
  runs: number;
  lastRunAt: Date;
}
