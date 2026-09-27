import fs from 'fs';
import path from 'path';

export type SystemEnvironmentMode = 'sandbox' | 'real';

interface SystemEnvState {
  mode: SystemEnvironmentMode;
  updatedAt: string;
}

const CONFIG_FILE_PATH = path.join(process.cwd(), 'prisma', 'system_env.json');

// In-memory cache to reduce frequent disk reads
let cachedState: SystemEnvState | null = null;

export function getSystemEnvMode(): SystemEnvironmentMode {
  try {
    if (cachedState) {
      return cachedState.mode;
    }

    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const content = fs.readFileSync(CONFIG_FILE_PATH, 'utf-8');
      const data = JSON.parse(content) as SystemEnvState;
      if (data.mode === 'real' || data.mode === 'sandbox') {
        cachedState = data;
        return data.mode;
      }
    }
  } catch (err) {
    console.error('Failed to read system_env.json:', err);
  }
  // Default to sandbox for safety
  return 'sandbox';
}

export function setSystemEnvMode(mode: SystemEnvironmentMode): SystemEnvState {
  const state: SystemEnvState = {
    mode,
    updatedAt: new Date().toISOString(),
  };

  try {
    const dir = path.dirname(CONFIG_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(state, null, 2), 'utf-8');
    cachedState = state;
  } catch (err) {
    console.error('Failed to write system_env.json:', err);
  }

  return state;
}
