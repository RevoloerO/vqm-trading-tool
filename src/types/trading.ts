/**
 * Trading calculator type definitions
 */

// Position Size Calculator Types
export interface PositionSizeInputs {
  accountSize: number;
  riskPercent: number;
  entryPrice: number;
  stopLoss: number;
}

export interface PositionSizeResult {
  shares: number;
  positionValue: string;
  riskAmount: string;
  riskPerShare: string;
  percentOfAccount: string;
}

// Risk/Reward Calculator Types
export interface RiskRewardInputs {
  entryPrice: number;
  stopLoss: number;
  targetPrice: number;
}

export interface RiskRewardResult {
  riskPerShare: string;
  rewardPerShare: string;
  rrRatio: string;
  positionType: 'Long' | 'Short';
  isValidTrade: boolean;
}

// API Response Types
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  field?: string;
  details?: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// Calculator Response Types
export type PositionSizeResponse = ApiResponse<PositionSizeResult>;
export type RiskRewardResponse = ApiResponse<RiskRewardResult>;
