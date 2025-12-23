
export interface SystemMetrics {
  voltage: number;
  current: number;
  power: number;
  efficiency: number;
  temperature: number;
  batteryLevel: number;
  dustLevel: number; // 0-100 percentage
  isWashRequired: boolean;
}

export interface AxisPosition {
  x: number; // 0-180 degrees
  y: number; // 0-180 degrees
}

export interface LdrData {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface SystemError {
  id: string;
  code: string;
  message: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'critical';
}

export interface User {
  username: string;
  email: string;
  isAuthenticated: boolean;
}
