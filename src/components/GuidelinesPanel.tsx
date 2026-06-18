/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BookOpen, ShieldCheck, HelpCircle, FileText, FileSignature, ArrowRight, ClipboardCheck } from 'lucide-react';
import { CertLevel, IdentityType } from '../types';

interface GuidelinesPanelProps {
  onSelectPreset: (level: CertLevel, identity: IdentityType) => void;
  currentLevel: CertLevel;
  currentIdentity: IdentityType;
}

export default function GuidelinesPanel({ onSelectPreset, currentLevel, currentIdentity }: GuidelinesPanelProps) {
  const [activeTab, setActiveTab] = useState<'rules' | 'scenarios' | 'terms'>('rules');

  const presets = [
    {
      title: '个人订阅 - 基础证书办理',
      desc: '运营商三要素或银行卡核验，适用低风险日常场景。',
      level: CertLevel.BASIC,
      identity: IdentityType.PERSONAL,
    },
    {
      title: '个人订阅 - 高级证书办理',
      desc: '强制活体人脸识别、视频核验、强意愿确认。高法律效力场景。',
      level: CertLevel.ADVANCED,
      identity: IdentityType.PERSONAL,
    },
    {
      title: '企业经办人 - 基础证书办理',
      desc: '基本企业核验 + 经办人身份核验 + 服务协议上传。',
      level: CertLevel.BASIC,
      identity: IdentityType.CORP_AGENT,
    },
    {
      title: '企业经办人 - 高级证书办理',
      desc: '企业四要素 + 经办人活体实人验证 + 对公账户小额打款验证 + 盖章授权书。',
      level: CertLevel.ADVANCED,
      identity: IdentityType.CORP_AGENT,
    },
    {
      title: '企业法人 - 基础证书办理',
      desc: '法定代表人线上资质极速核验，简易工商核对。',
      level: CertLevel.BASIC,
      identity: IdentityType.CORP_LEGAL,
    },
    {
      title: '企业法人 - 高级证书办理',
      desc: '法定代表人活体实人极速验证，高安全等级免经办人授权。',
      level: CertLevel.ADVANCED,
      identity: IdentityType.CORP_LEGAL,
    },
  ];

  return (
    <div className="flex flex-col h-full bg-white border-r border-[#E2E8F0] text-slate-800" id="guidelines-panel">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-2">
          <div className="bg-[#0D5EFA] p-1.5 rounded-none text-white">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h1 className="text-md font-extrabold font-sans tracking-tight text-slate-900">CA数字证书办理统一流程</h1>
            <p className="text-xs text-slate-500">符合 T/CQAE 11034-2025 规范标准</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E2E8F0] text-sm bg-[#FAFBFD]">
        <button
          onClick={() => setActiveTab('rules')}
          className={`flex-1 py-3 text-center border-b-2 font-bold transition ${
            activeTab === 'rules' ? 'border-[#0D5EFA] text-[#0D5EFA] bg-white' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
          id="tab-rules"
        >
          <BookOpen className="inline-block mr-1" size={14} />
          规范细则
        </button>
        <button
          onClick={() => setActiveTab('scenarios')}
          className={`flex-1 py-3 text-center border-b-2 font-bold transition ${
            activeTab === 'scenarios' ? 'border-[#0D5EFA] text-[#0D5EFA] bg-white' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
          id="tab-presets"
        >
          <ClipboardCheck className="inline-block mr-1" size={14} />
          模拟预设
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin">
        {activeTab === 'rules' && (
          <div className="space-y-6 text-xs text-slate-600 leading-relaxed font-sans">
            {/* Section 1 */}
            <div>
              <h2 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-1.5 border-b border-[#E2E8F0] pb-1">
                <span className="text-[#0D5EFA]">1.</span> 规范总则
              </h2>
              <ul className="space-y-1.5 list-disc pl-4 text-slate-600">
                <li><strong className="text-slate-800">制定目的：</strong> 统一各CA数字证书全生命周期办理流程，实现流程标准化、交互一致化。 </li>
                <li><strong className="text-slate-800">适用范围：</strong> 证书申请、身份核验、协议签署、签发、解密等；支持个人及企业订户。</li>
                <li><strong className="text-slate-800">核心合规：</strong>
                  <ul className="list-circle pl-4 mt-1 space-y-1 text-slate-500">
                    <li>保留原有各机构核验限制、有效期。</li>
                    <li>高级证书<span className="text-amber-600 font-bold">严禁降级</span>使用运营商简易核验。</li>
                    <li>全部过程确保可追溯，独立留痕、独立建档。</li>
                  </ul>
                </li>
              </ul>
            </div>

            {/* Section 2 */}
            <div>
              <h2 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-1.5 border-b border-[#E2E8F0] pb-1">
                <span className="text-[#0D5EFA]">2.</span> 基础规则 & 名词释义
              </h2>
              <div className="space-y-2.5">
                <div className="bg-[#FAFBFD] p-3 border border-[#E2E8F0] rounded-none">
                  <div className="font-bold text-slate-900 flex justify-between">
                    <span>🛡️ 基础级证书</span>
                    <span className="text-emerald-600">低风险场景</span>
                  </div>
                  <p className="text-slate-600 mt-1">
                    用于普通登录、普通签效。核验可使用运营商三要素、银行四要素、人脸识别。
                    <span className="text-amber-600 font-medium"> 限制：禁止招投标、大额交易。</span>
                  </p>
                </div>

                <div className="bg-[#FAFBFD] p-3 border border-[#E2E8F0] rounded-none">
                  <div className="font-bold text-slate-900 flex justify-between">
                    <span>💎 高级证书(高等级)</span>
                    <span className="text-amber-600">高风险/招投标</span>
                  </div>
                  <p className="text-slate-600 mt-1">
                    高法律效力签约。核验<span className="text-[#0D5EFA] font-semibold">必须使用活体人脸、视频双录等实人核验</span>。意愿确认需用音视频录制强确认。
                  </p>
                </div>
              </div>
            </div>

            {/* Section 3 */}
            <div>
              <h2 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-1.5 border-b border-[#E2E8F0] pb-1">
                <span className="text-[#0D5EFA]">3.</span> 核验方式说明 (合规标准)
              </h2>
              <div className="space-y-2 text-[11px] font-mono leading-relaxed">
                <div className="flex gap-2">
                  <span className="text-[#0D5EFA] font-bold shrink-0">运营商三要素:</span>
                  <span className="text-slate-600">核验姓名、身份证、手机号一致，加短信验证。</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-[#0D5EFA] font-bold shrink-0">银行卡四要素:</span>
                  <span className="text-slate-600">姓名、身份证、银行卡、银行预留码一致。</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-[#0D5EFA] font-bold shrink-0">对公打款验证:</span>
                  <span className="text-slate-600">向企业对公账户转入随机微额，回填金额校验。</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-[#0D5EFA] font-bold shrink-0">人工审核:</span>
                  <span className="text-slate-600">材料缺失时自动排队启动人工后台多项复核。</span>
                </div>
              </div>
            </div>

            {/* Section 4 */}
            <div>
              <h2 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-1.5 border-b border-[#E2E8F0] pb-1">
                <span className="text-[#0D5EFA]">4.</span> 统一步骤框架 (7大标准环节)
              </h2>
              <div className="relative pl-4 border-l border-[#E2E8F0] space-y-4 py-1 text-[11px] text-slate-500">
                <div className="relative">
                  <div className="absolute -left-[20.5px] top-0.5 bg-[#0D5EFA] h-3 w-3 rounded-full border-2 border-white shadow-sm"></div>
                  <p className="font-bold text-slate-800">1. 流程启动</p>
                  <span>选择各级规格，基础安全滑动防攻验证</span>
                </div>
                <div className="relative">
                  <div className="absolute -left-[20.5px] top-0.5 bg-[#0D5EFA] h-3 w-3 rounded-full border-2 border-white shadow-sm"></div>
                  <p className="font-bold text-slate-800">2. 风险告知 & 协议阅读</p>
                  <span>强制无盲区条款阅读并倒计时触发</span>
                </div>
                <div className="relative">
                  <div className="absolute -left-[20.5px] top-0.5 bg-[#0D5EFA] h-3 w-3 rounded-full border-2 border-white shadow-sm"></div>
                  <p className="font-bold text-slate-800">3. 身份核验 & 意愿确认</p>
                  <span>直连公安认证。高级证书必刷脸实人活体</span>
                </div>
                <div className="relative">
                  <div className="absolute -left-[20.5px] top-0.5 bg-[#0D5EFA] h-3 w-3 rounded-full border-2 border-white shadow-sm"></div>
                  <p className="font-bold text-slate-800">4. 专项补充校验</p>
                  <span>高级/独立分支（对公转账或音视频声明）</span>
                </div>
                <div className="relative">
                  <div className="absolute -left-[20.5px] top-0.5 bg-[#0D5EFA] h-3 w-3 rounded-full border-2 border-white shadow-sm"></div>
                  <p className="font-bold text-slate-800">5. 材料上传 (企业必填)</p>
                  <span>企业办理按法定代表人和经办人分类上传证照授权材料，个人版跳过</span>
                </div>
                <div className="relative">
                  <div className="absolute -left-[20.5px] top-0.5 bg-[#0D5EFA] h-3 w-3 rounded-full border-2 border-white shadow-sm"></div>
                  <p className="font-bold text-slate-800">6. 证书签发 / 接口调用</p>
                  <span>客户端私钥密码学固化签名与PIN锁芯片托管</span>
                </div>
                <div className="relative">
                  <div className="absolute -left-[20.5px] top-0.5 bg-emerald-500 h-3 w-3 rounded-full border-2 border-white shadow-sm"></div>
                  <p className="font-bold text-slate-800">7. 结果处置 & 异常处理</p>
                  <span>办结存档、存根电子化，人机拒绝回流重审</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'scenarios' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              请选择不同的订户身份与证书等级，并在右侧手机模拟器中，依次走完<b>规范7大环节</b>流程。
            </p>

            <div className="space-y-2.5">
              {presets.map((preset, idx) => {
                const isSelected = currentLevel === preset.level && currentIdentity === preset.identity;
                return (
                  <button
                    key={idx}
                    onClick={() => onSelectPreset(preset.level, preset.identity)}
                    className={`w-full text-left p-3.5 border transition duration-150 rounded-none ${
                      isSelected
                        ? 'bg-[#EAF3FE] border-[#0D5EFA] text-[#0D5EFA] font-bold shadow-sm'
                        : 'bg-white border-[#E2E8F0] text-slate-700 hover:bg-slate-50 hover:border-slate-400'
                    }`}
                    id={`preset-${idx}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-bold text-xs font-sans flex items-center gap-1.5 ${isSelected ? 'text-[#0D5EFA]' : 'text-slate-800'}`}>
                        {preset.title}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] bg-[#0D5EFA] text-white px-2 py-0.5 rounded-none font-sans font-bold">
                          测试中
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">{preset.desc}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-none font-mono font-bold ${
                        preset.level === CertLevel.ADVANCED ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {preset.level === CertLevel.ADVANCED ? '高级证书' : '基础证书'}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-none bg-slate-100 text-slate-600 font-sans">
                        {preset.identity === IdentityType.PERSONAL ? '个人' : preset.identity === IdentityType.CORP_LEGAL ? '企业法人' : '企业经办人'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="bg-[#FFFBEB] p-4.5 border border-[#FDE68A] text-amber-950 space-y-1.5 text-xs rounded-none mt-4 leading-relaxed font-medium">
              <span className="font-bold flex items-center gap-1 text-amber-850">
                ⚠️ 实人核验限制验证：
              </span>
              <span>
                在身份核验流程中，我们模拟了<b>核验失败次数限制</b>规则。当核验失败次数达到最高限（3次）时，系统会自动断开线上通道并<b>强制跳转人工审批通道</b>。
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
