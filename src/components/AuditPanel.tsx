/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Terminal, Shield, Award, CheckCircle2, AlertTriangle, Eye, Clock, Download, RefreshCw, FileText } from 'lucide-react';
import { VerificationLog, IssuedCertificate, CertLevel, IdentityType } from '../types';

interface AuditPanelProps {
  logs: VerificationLog[];
  issuedCerts: IssuedCertificate[];
  currentCertState: {
    fullName: string;
    companyName?: string;
    uscc?: string;
    level: CertLevel;
    identityType: IdentityType;
    isVerified: boolean;
    signatureDone: boolean;
    flowStatus: string;
    currentStep: number;
  };
  onClearLogs: () => void;
  onSimulateCorpTransfer: () => void;
  simulatedCorpTransferValue: string;
}

export default function AuditPanel({
  logs,
  issuedCerts,
  currentCertState,
  onClearLogs,
  onSimulateCorpTransfer,
  simulatedCorpTransferValue,
}: AuditPanelProps) {
  return (
    <div className="flex flex-col h-full bg-white border-l border-[#E2E8F0] text-slate-800" id="audit-panel">
      {/* Header */}
      <div className="p-4 border-b border-[#E2E8F0] flex justify-between items-center bg-[#FAFBFD]">
        <div className="flex items-center gap-2">
          <Terminal size={18} className="text-[#0D5EFA]" />
          <h2 className="text-sm font-bold font-sans tracking-tight text-slate-800">CA安全审计与留痕追踪</h2>
        </div>
        <button
          onClick={onClearLogs}
          className="text-xs text-slate-600 hover:text-slate-950 transition flex items-center gap-1 bg-white border border-[#CBD5E1] py-1 px-2.5 rounded-none"
          title="清除审计日志"
          id="btn-clear-logs"
        >
          <RefreshCw size={12} />
          重置
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Compliance Progress Card */}
        <div className="bg-[#FAFBFD] p-3.5 border border-[#E2E8F0] rounded-none">
          <h3 className="text-xs font-bold text-slate-800 font-sans mb-3 flex items-center justify-between border-b border-[#E2E8F0]/80 pb-1.5">
            <span>当前业务合规检查项</span>
            <span className="text-[10px] text-slate-500 font-mono">Step {currentCertState.currentStep}/7</span>
          </h3>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white p-2 border border-[#E2E8F0] rounded-none">
              <span className="text-slate-400 block text-[10px]">协议强制阅读</span>
              <span className={`font-bold ${currentCertState.currentStep > 1 ? 'text-emerald-600' : 'text-slate-400'}`}>
                {currentCertState.currentStep > 1 ? '✓ 已阅读' : '● 未完成'}
              </span>
            </div>
            <div className="bg-white p-2 border border-[#E2E8F0] rounded-none">
              <span className="text-slate-400 block text-[10px]">滑动安全验证</span>
              <span className={`font-bold ${currentCertState.currentStep > 2 ? 'text-emerald-600' : 'text-slate-400'}`}>
                {currentCertState.currentStep > 2 ? '✓ 通过' : '● 等待验证'}
              </span>
            </div>
            <div className="bg-white p-2 border border-[#E2E8F0] rounded-none">
              <span className="text-slate-400 block text-[10px]">身份认证情况</span>
              <span className={`font-bold ${
                currentCertState.isVerified ? 'text-emerald-600' : 
                currentCertState.flowStatus === 'MANUAL_AUDIT_PENDING' ? 'text-amber-600' : 'text-slate-400'
              }`}>
                {currentCertState.isVerified ? '✓ 实人一致' : 
                 currentCertState.flowStatus === 'MANUAL_AUDIT_PENDING' ? '● 人工待审' : '● 未认证'}
              </span>
            </div>
            <div className="bg-white p-2 border border-[#E2E8F0] rounded-none">
              <span className="text-slate-400 block text-[10px]">意愿签署确认</span>
              <span className={`font-bold ${currentCertState.signatureDone ? 'text-emerald-600' : 'text-slate-400'}`}>
                {currentCertState.signatureDone ? '✓ 签署生效' : '● 未签署'}
              </span>
            </div>
          </div>
        </div>

        {/* Corporate helper sandbox if corporate selected */}
        {currentCertState.identityType !== IdentityType.PERSONAL && currentCertState.level === CertLevel.ADVANCED && (
          <div className="bg-[#F0F7FF] p-4 border border-[#BCD4FF] rounded-none">
            <h3 className="text-xs font-bold text-[#0D5EFA] font-sans mb-1 flex items-center gap-1.5">
              <Shield size={14} />
              对公打款测试沙盒
            </h3>
            <p className="text-[11px] text-slate-500 leading-normal mb-2.5">
              在企业经办人高级核验阶段，系统会向企业对公账户发送随机打款。在此处一键查收该笔款项以模拟银行入账获取核验金额：
            </p>
            <div className="flex gap-2">
              <div className="bg-white px-3 py-1.5 text-xs font-mono font-bold text-[#0D5EFA] flex-1 flex items-center justify-between border border-[#BCD4FF] rounded-none">
                <span className="text-[10px] text-slate-400">模拟到账金额:</span>
                <span>¥ {simulatedCorpTransferValue}</span>
              </div>
              <button
                onClick={onSimulateCorpTransfer}
                className="bg-[#0D5EFA] hover:bg-[#0b51d6] text-white font-bold text-xs px-3 py-1 rounded-none transition flex items-center gap-1 shadow-sm"
                id="btn-simulate-transfer"
              >
                生成/刷新入账
              </button>
            </div>
          </div>
        )}

        {/* Active Audit Log Timeline */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-800 font-sans flex items-center gap-1.5">
              <Clock size={14} className="text-slate-500" />
              业务留痕日志 (操作审计档案)
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">{logs.length} 条记录</span>
          </div>

          <div 
            className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 h-[180px] overflow-y-auto space-y-2 text-[11px] font-mono select-text rounded-none" 
            id="audit-timeline"
          >
            {logs.length === 0 ? (
              <div className="text-slate-400 text-center py-10">
                <p>暂无日志纪录</p>
                <p className="text-[9px] mt-1">请在左侧手机模拟器中开始办理流程</p>
              </div>
            ) : (
              logs.map((log) => {
                const badgeColor = 
                  log.status === 'SUCCESS' ? 'text-emerald-600 font-bold' :
                  log.status === 'FAILED' ? 'text-rose-600 font-bold' :
                  log.status === 'WARN' ? 'text-amber-600 font-bold' : 'text-blue-600 font-bold';
                
                return (
                  <div key={log.id} className="border-b border-slate-200/60 pb-1.5 last:border-0 last:pb-0">
                    <div className="flex justify-between text-slate-400 text-[10px] mb-0.5">
                      <span>{log.timestamp}</span>
                      <span className={badgeColor}>{log.status}</span>
                    </div>
                    <div className="text-slate-700 leading-normal">
                      <span className="text-[#0D5EFA] font-medium">[{log.action}]</span> {log.details}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Issued Certificates Database */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-800 font-sans flex items-center gap-1.5">
            <Award size={14} className="text-[#0D5EFA]" />
            已签发数字证书档案库
          </h3>

          {issuedCerts.length === 0 ? (
            <div className="bg-[#FAFBFD] border border-[#E2E8F0] rounded-none p-6 text-center text-xs text-slate-400">
              <Shield className="mx-auto text-slate-300 mb-2" size={24} />
              暂无已签发证书。请通过模拟器完成数字证书申请。
            </div>
          ) : (
            <div className="space-y-3">
              {issuedCerts.map((cert) => (
                <div key={cert.id} className="bg-[#FAFBFD] border border-[#BCD4FF] rounded-none p-4 relative overflow-hidden text-xs shadow-sm">
                  {/* Decorative stamp watermark */}
                  <div className="absolute right-2 bottom-2 text-[#0D5EFA] select-none pointer-events-none transform rotate-12">
                    <Shield size={64} className="opacity-5 text-blue-500" />
                  </div>

                  <div className="flex justify-between items-start mb-2 border-b border-[#E2E8F0] pb-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-800">
                          {cert.identityType === IdentityType.PERSONAL ? '个人数字证书' : '企业数字证书'}
                        </span>
                        <span className={`text-[9px] px-2 py-0.5 rounded-none font-mono font-bold ${
                          cert.level === CertLevel.ADVANCED ? 'bg-amber-100 text-amber-800' : 'bg-blue-50 text-blue-800'
                        }`}>
                          {cert.level === CertLevel.ADVANCED ? '高级证书' : '基础证书'}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono block mt-1">SN: {cert.serialNumber}</span>
                    </div>
                    <span className="text-emerald-700 bg-emerald-50 text-[10px] px-2 py-0.5 rounded-none border border-emerald-200">
                      ● 已生效
                    </span>
                  </div>

                  <div className="space-y-1.5 font-mono text-[11px] text-slate-600 relative z-10 leading-normal">
                    <div className="flex justify-between">
                      <span>订户名称:</span>
                      <span className="text-slate-950 font-sans font-bold">{cert.ownerName}</span>
                    </div>
                    {cert.companyName && (
                      <div className="flex justify-between">
                        <span>主体名称:</span>
                        <span className="text-slate-950 font-sans font-bold truncate max-w-[150px]">{cert.companyName}</span>
                      </div>
                    )}
                    {cert.uscc && (
                      <div className="flex justify-between">
                        <span>社会信用代码:</span>
                        <span className="text-slate-700 text-[10px]">{cert.uscc}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>算法标准:</span>
                      <span className="text-[#0D5EFA] font-bold">{cert.algorithm}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-450 mt-2.5 pt-1.5 border-t border-[#E2E8F0]">
                      <span>签发日期: {cert.issueDate}</span>
                      <span>至 {cert.expireDate}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
