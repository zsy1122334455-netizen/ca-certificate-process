/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum CertLevel {
  BASIC = 'BASIC',
  ADVANCED = 'ADVANCED',
}

export enum IdentityType {
  PERSONAL = 'PERSONAL',
  CORP_LEGAL = 'CORP_LEGAL', // 企业/机构 - 法定代表人
  CORP_AGENT = 'CORP_AGENT', // 企业/机构 - 经办人
}

export enum VerificationMethod {
  OPERATOR_3_FACTOR = 'OPERATOR_3_FACTOR', // 运营商三要素 (姓名, 身份证, 手机号 + 短信)
  BANK_4_FACTOR = 'BANK_4_FACTOR',       // 银行卡四要素 (姓名, 身份证, 银行卡, 手机号)
  LIVENESS_FACE = 'LIVENESS_FACE',       // 人脸识别(活体检测)
  PUBLIC_ACCOUNT_PAY = 'PUBLIC_ACCOUNT_PAY', // 企业对公打款校验
  MANUAL_AUDIT = 'MANUAL_AUDIT',         // 人工审核
}

export interface VerificationLog {
  id: string;
  timestamp: string;
  action: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'WARN';
  details: string;
}

export interface IssuedCertificate {
  id: string;
  serialNumber: string;
  level: CertLevel;
  identityType: IdentityType;
  ownerName: string;
  companyName?: string;
  uscc?: string; // 统一社会信用代码
  issueDate: string;
  expireDate: string;
  algorithm: string; // e.g. SM2, RSA-2048
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
}

export interface FlowState {
  // Config
  level: CertLevel;
  identityType: IdentityType;
  
  // Progress (1 to 7 steps)
  // Step 1: 流程启动 (Entrance / Slider Safe Guard)
  // Step 2: 风险告知 & 协议阅读 (Forced countdown)
  // Step 3: 身份核验 & 意愿确认
  // Step 4: 专项补充校验 (Video double recording / Corporate Account micro transfer)
  // Step 5: 材料上传 & 协议签署
  // Step 6: 证书签发 / PIN设置
  // Step 7: 结果处置 & 异常处理
  currentStep: number;
  
  // Form input data
  userIdCardLast4: string; // Entry verify
  sliderPassed: boolean;
  
  // User info
  fullName: string;
  idCardNumber: string;
  phoneNumber: string;
  smsOtp: string;
  bankCardNumber: string;
  
  // Corporate info
  companyName: string;
  uscc: string; // 统一社会信用代码
  legalRepName: string;
  legalRepIdCard: string;
  
  // Special Verification Check (Bank random micro transfer code or input amount)
  sentMicroAmount: string; // The simulated amount sent to the corporate account, e.g. '0.24'
  inputMicroAmount: string; // Amount entered by user to verify
  
  // Uploaded documents
  uploadedFiles: {
    id: string;
    name: string;
    type: 'BUSINESS_LICENSE' | 'LEGAL_AUTH_LETTER' | 'SEALED_AGREEMENT' | 'ID_FRONT' | 'ID_BACK';
    previewUrl?: string;
  }[];
  
  // Verification states
  selectedMethod: VerificationMethod | null;
  verifyAttempts: number;
  maxAttempts: number;
  isVerified: boolean;
  isManuallySubmitting: boolean;
  manualAuditPhotos: string[]; // Uploaded photos for manual audit
  
  // Signature status
  signatureDone: boolean;
  signatureDataUrl?: string;
  
  // PIN code
  pinCode: string;
  
  // Current Status
  flowStatus: 'PROCESSING' | 'SUCCESS' | 'MANUAL_AUDIT_PENDING' | 'REJECTED';
}
