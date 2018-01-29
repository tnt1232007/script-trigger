import { Command } from './command';

export interface Activity {
  commands: Command[];
  voice: string;
  isSuccess: boolean;
  response: any;
  runAt: Date;
}
