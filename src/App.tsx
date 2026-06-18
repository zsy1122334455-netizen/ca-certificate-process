/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import GuidelinesPanel from './components/GuidelinesPanel';
import MobileSimulator from './components/MobileSimulator';
import AuditPanel from './components/AuditPanel';
import { CertLevel, IdentityType, VerificationLog, IssuedCertificate } from './types';
import { ShieldCheck, Cpu, Terminal, Sparkles, HelpCircle, FileText } from 'lucide-react';

export default function App() {
  // 1. Core State
  const [currentLevel, setCurrentLevel] = useState<CertLevel>(CertLevel.BASIC);
  const [currentIdentityType, setCurrentIdentityType] = useState<IdentityType>(IdentityType.PERSONAL);

  // Simulated Penny value for corporate agent authentication
  const [simulatedCorpTransferValue, setSimulatedCorpTransferValue] = useState('0.18');

  // Logs tracking
  const [logs, setLogs] = useState<VerificationLog[]>([]);

  // Database of issued certificates
  const [issuedCerts, setIssuedCerts] = useState<IssuedCertificate[]>([
    {
      id: 'cert_1',
      serialNumber: 'CN_SM2_2026_0504123',
      level: CertLevel.BASIC,
      identityType: IdentityType.PERSONAL,
      ownerName: '赵铁柱',
      issueDate: '2026-05-10',
      expireDate: '2027-05-10',
      algorithm: '国密 SM2 双向非对称',
      status: 'ACTIVE',
    }
  ]);

  // Current active simulator flow info to report to the compliance checklist panel
  const [currentCertState, setCurrentCertState] = useState({
    fullName: '王德华',
    companyName: '',
    uscc: '',
    level: CertLevel.BASIC,
    identityType: IdentityType.PERSONAL,
    isVerified: false,
    signatureDone: false,
    flowStatus: 'PROCESSING',
    currentStep: 1,
  });

  // 2. Action Handlers
  const addAuditLog = (action: string, status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'WARN', details: string) => {
    const timestamp = new Date().toLocaleTimeString('zh-CN', { hour12: false });
    const newLog: VerificationLog = {
      id: Math.random().toString(36).substring(7),
      timestamp,
      action,
      status,
      details,
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const handleSelectPreset = (level: CertLevel, identity: IdentityType) => {
    setCurrentLevel(level);
    setCurrentIdentityType(identity);
  };

  const generateNewCorpTransferValue = () => {
    // Generate a random penny value e.g. "0.24", "0.89" etc.
    const amt = (Math.random() * 0.99 + 0.01).toFixed(2);
    setSimulatedCorpTransferValue(amt);
    addAuditLog('核心打款模拟器', 'SUCCESS', `生成了新的测试到账微额凭证：¥ ${amt}。供复制填报中！`);
  };

  const handleIssueCertificate = (detail: { ownerName: string; companyName?: string; uscc?: string }) => {
    const now = new Date();
    const issueDate = now.toISOString().split('T')[0];
    const expireDate = new Date(now.setFullYear(now.getFullYear() + 1)).toISOString().split('T')[0];
    
    const newCert: IssuedCertificate = {
      id: 'cert_' + Math.random().toString(36).substring(7),
      serialNumber: 'CN_' + (currentLevel === CertLevel.ADVANCED ? 'SM2_ADV_' : 'RSA_BSC_') + Math.random().toString().slice(2, 9),
      level: currentLevel,
      identityType: currentIdentityType,
      ownerName: detail.ownerName || '未授权名商',
      companyName: detail.companyName,
      uscc: detail.uscc,
      issueDate,
      expireDate,
      algorithm: currentLevel === CertLevel.ADVANCED ? 'SM2 国密椭圆密码 (ECC)' : 'RSA-2048 国际标准算法',
      status: 'ACTIVE',
    };

    setIssuedCerts(prev => [newCert, ...prev]);
  };

  // Seed initial log on platform start
  useEffect(() => {
    addAuditLog('CA系统初始化', 'SUCCESS', 'CA 统一办理全生命周期交互规范大厅准备就绪。');
    addAuditLog('通信协议校准', 'SUCCESS', '国密网关联调成功。公安部实名接口联调：READY。');
  }, []);

  return (
    <div className="min-h-screen w-screen bg-[#F4F6F9] flex flex-col font-sans" id="app-root">
      {/* 3-Column Cockpit Workspace */}
      <div className="flex-grow flex flex-col lg:flex-row overflow-hidden">
        
        {/* Left Column: Guidelines / Specification Documents and Test Presets */}
        <div className="w-full lg:w-80 xl:w-96 shrink-0 h-[350px] lg:h-full border-b lg:border-b-0 lg:border-r border-[#E2E8F0]">
          <GuidelinesPanel 
            onSelectPreset={handleSelectPreset}
            currentLevel={currentLevel}
            currentIdentity={currentIdentityType}
          />
        </div>

        {/* Central Core Workspace: Mobile Simulator Platform */}
        <div className="flex-grow bg-[#F4F6F9] flex flex-col justify-start items-center p-4 xl:p-6 overflow-y-auto min-w-0">
          
          {/* POLISHED PILOT CONTROLS (Floating header) */}
          <div className="w-full max-w-sm flex flex-col sm:flex-row gap-3 sm:gap-4 mb-5 select-none items-center justify-between bg-white border border-[#E2E8F0] p-3 rounded-none shadow-sm">
            <div className="flex items-center gap-2 text-xs text-slate-700 font-bold">
              <span className="text-slate-500">等级:</span>
              <div className="flex p-0.5 bg-[#F1F5F9] rounded-none border border-[#E2E8F0]">
                <button 
                  onClick={() => handleSelectPreset(CertLevel.BASIC, currentIdentityType)}
                  className={`px-3 py-1 font-bold rounded-none text-[11px] transition duration-150 ${currentLevel === CertLevel.BASIC ? 'bg-[#0D5EFA] text-white' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  基础
                </button>
                <button 
                  onClick={() => handleSelectPreset(CertLevel.ADVANCED, currentIdentityType)}
                  className={`px-3 py-1 font-bold rounded-none text-[11px] transition duration-150 ${currentLevel === CertLevel.ADVANCED ? 'bg-[#0D5EFA] text-white' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  高级
                </button>
              </div>
            </div>

            <div className="hidden sm:block w-[1px] h-4 bg-[#E2E8F0]"></div>

            <div className="flex items-center gap-2 text-xs text-slate-700 font-bold">
              <span className="text-slate-500">主体:</span>
              <div className="flex p-0.5 bg-[#F1F5F9] rounded-none border border-[#E2E8F0]">
                <button 
                  onClick={() => handleSelectPreset(currentLevel, IdentityType.PERSONAL)}
                  className={`px-3 py-1 font-bold rounded-none text-[11px] transition duration-150 ${currentIdentityType === IdentityType.PERSONAL ? 'bg-[#0D5EFA] text-white' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  个人
                </button>
                <button 
                  onClick={() => handleSelectPreset(currentLevel, IdentityType.CORP_LEGAL)}
                  className={`px-3 py-1 font-bold rounded-none text-[11px] transition duration-150 ${currentIdentityType === IdentityType.CORP_LEGAL ? 'bg-[#0D5EFA] text-white' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  法人
                </button>
                <button 
                  onClick={() => handleSelectPreset(currentLevel, IdentityType.CORP_AGENT)}
                  className={`px-3 py-1 font-bold rounded-none text-[11px] transition duration-150 ${currentIdentityType === IdentityType.CORP_AGENT ? 'bg-[#0D5EFA] text-white' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  经办人
                </button>
              </div>
            </div>
          </div>

          {/* MOBILE SIMULATOR IN AN ELEGANT PORTRAIT WORKSPACE */}
          <div className="w-full flex-1 flex items-center justify-center">
            <MobileSimulator 
              currentLevel={currentLevel}
              currentIdentityType={currentIdentityType}
              simulatedCorpTransferValue={simulatedCorpTransferValue}
              onFlowStateChange={(partialState) => setCurrentCertState(prev => ({ ...prev, ...partialState }))}
              onAddAuditLog={addAuditLog}
              onIssueCertificate={handleIssueCertificate}
            />
          </div>
        </div>

        {/* Right Column: Security Audits & Tracking Logs */}
        <div className="w-full lg:w-80 xl:w-96 shrink-0 h-[350px] lg:h-full border-t lg:border-t-0 lg:border-l border-[#E2E8F0]">
          <AuditPanel 
            logs={logs}
            issuedCerts={issuedCerts}
            currentCertState={currentCertState}
            onClearLogs={() => {
              setLogs([]);
              addAuditLog('CA系统重置', 'SUCCESS', '已手动重置所有安全审计日志，系统恢复空闲。');
            }}
            onSimulateCorpTransfer={generateNewCorpTransferValue}
            simulatedCorpTransferValue={simulatedCorpTransferValue}
          />
        </div>
      </div>
    </div>
  );
}

