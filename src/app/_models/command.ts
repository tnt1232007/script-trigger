export interface Command {
  guid: string;
  name: string;
  voice: string;
  script: string;
  params: string[];
  createdAt: Date;
  runs: number;
  lastRunAt: Date;
}
