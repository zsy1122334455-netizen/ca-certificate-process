/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Smartphone, Shield, CheckCircle2, AlertCircle, RefreshCw, Key, ArrowRight,
  ChevronRight, Lock, Camera, Upload, Check, Video, Phone, HelpCircle, Eye, EyeOff, UserCheck,
  Download, CheckCircle, Plus, Sparkles
} from 'lucide-react';
import { CertLevel, IdentityType, VerificationMethod, FlowState } from '../types';

interface MobileSimulatorProps {
  onFlowStateChange: (state: Partial<FlowState>) => void;
  onAddAuditLog: (action: string, status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'WARN', details: string) => void;
  onIssueCertificate: (certDetail: { ownerName: string; companyName?: string; uscc?: string }) => void;
  currentLevel: CertLevel;
  currentIdentityType: IdentityType;
  simulatedCorpTransferValue: string;
}

export default function MobileSimulator({
  onFlowStateChange,
  onAddAuditLog,
  onIssueCertificate,
  currentLevel,
  currentIdentityType,
  simulatedCorpTransferValue,
}: MobileSimulatorProps) {
  
  // 1. Initial Flow State Initialization
  const [state, setState] = useState<FlowState>({
    level: currentLevel,
    identityType: currentIdentityType,
    currentStep: 1,
    
    userIdCardLast4: '',
    sliderPassed: false,
    
    fullName: '',
    idCardNumber: '',
    phoneNumber: '',
    smsOtp: '',
    bankCardNumber: '',
    
    companyName: '',
    uscc: '',
    legalRepName: '',
    legalRepIdCard: '',
    
    sentMicroAmount: simulatedCorpTransferValue,
    inputMicroAmount: '',
    
    uploadedFiles: [],
    
    selectedMethod: null,
    verifyAttempts: 0,
    maxAttempts: 3,
    isVerified: false,
    isManuallySubmitting: false,
    manualAuditPhotos: [],
    
    signatureDone: false,
    pinCode: '',
    flowStatus: 'PROCESSING',
  });

  // Keep levels in sync when preset is selected from guidelines panel
  useEffect(() => {
    setState(prev => {
      const isLegal = currentIdentityType === IdentityType.CORP_LEGAL;
      const isAgent = currentIdentityType === IdentityType.CORP_AGENT;
      const isCorp = isLegal || isAgent;

      return {
        ...prev,
        level: currentLevel,
        identityType: currentIdentityType,
        currentStep: 1, // reset step
        sliderPassed: false,
        userIdCardLast4: '',
        isVerified: false,
        selectedMethod: null,
        verifyAttempts: 0,
        signatureDone: false,
        pinCode: '',
        flowStatus: 'PROCESSING',
        fullName: isLegal ? '张华夏' : '',
        idCardNumber: isLegal ? '310115197805121021' : '',
        phoneNumber: '',
        companyName: isLegal 
          ? '华夏建筑工程集团有限公司' 
          : isAgent 
            ? '中金金融认证中心有限公司' 
            : '',
        uscc: isLegal 
          ? '91310000MA1FL4TW7Y' 
          : isAgent 
            ? '91110000759626025U' 
            : '',
        legalRepName: isLegal 
          ? '张华夏' 
          : isAgent 
            ? '刘先亮' 
            : '',
        legalRepIdCard: isLegal 
          ? '310115197805121021' 
          : isAgent 
            ? '110101198402220021' 
            : '',
      };
    });
    
    const timer = setTimeout(() => {
      onAddAuditLog('选择测试预设', 'SUCCESS', `初始化为 ${currentIdentityType} • ${currentLevel === CertLevel.ADVANCED ? '高级证书' : '基础证书'}`);
    }, 0);
    return () => clearTimeout(timer);
  }, [currentLevel, currentIdentityType]);

  const getHeaderTitle = () => {
    if (state.currentStep === 1) {
      return '服务协议与风险告知';
    }
    if (state.currentStep === 2) {
      return state.identityType === IdentityType.PERSONAL ? '个人身份实名核验' : '企业工商四要素认证';
    }
    if (state.currentStep === 3) {
      return state.selectedMethod === VerificationMethod.LIVENESS_FACE ? '人脸识别' : '身份核验';
    }
    if (state.currentStep === 4) {
      return '对公账户微额核验';
    }
    if (state.currentStep === 5) {
      return '资料上传';
    }
    if (state.currentStep === 6) {
      return '个人/企业高级意愿双录';
    }
    if (state.currentStep === 7) {
      return '认证信息已提交';
    }
    return '高级数字证书办理';
  };

  // Update transfer value when parent updates it
  useEffect(() => {
    setState(prev => ({ ...prev, sentMicroAmount: simulatedCorpTransferValue }));
  }, [simulatedCorpTransferValue]);

  // 2. Local View States
  const [sliderPosition, setSliderPosition] = useState(0);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const sliderTrackRef = useRef<HTMLDivElement>(null);
  
  const [agreementCountdown, setAgreementCountdown] = useState(5);
  const [agreementsChecked, setAgreementsChecked] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  
  const [otpSent, setOtpSent] = useState(false);
  const [otpCountDown, setOtpCountDown] = useState(60);
  
  // Custom camera liveness tracking simulation
  const [livenessStage, setLivenessStage] = useState<'blink' | 'mouth' | 'nod' | 'success'>('blink');
  const [livenessTimer, setLivenessTimer] = useState(3);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraPermissionError, setCameraPermissionError] = useState(false);

  // Manual hand-signature state
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawingSignature, setIsDrawingSignature] = useState(false);

  // Set default form credentials on focus mode
  useEffect(() => {
    const timer = setTimeout(() => {
      onFlowStateChange({
        fullName: state.fullName || '无',
        phoneNumber: state.phoneNumber || '无',
        companyName: state.companyName || '无',
        uscc: state.uscc || '无',
        level: state.level,
        identityType: state.identityType,
        isVerified: state.isVerified,
        signatureDone: state.signatureDone,
        flowStatus: state.flowStatus,
        currentStep: state.currentStep,
      });
    }, 0);
    return () => clearTimeout(timer);
  }, [
    state.fullName, 
    state.phoneNumber, 
    state.companyName,
    state.uscc,
    state.level, 
    state.identityType, 
    state.isVerified, 
    state.signatureDone, 
    state.flowStatus, 
    state.currentStep,
    onFlowStateChange
  ]);

  // Reset Step 1 states when step is loaded
  useEffect(() => {
    if (state.currentStep === 1) {
      setAgreementCountdown(state.level === CertLevel.ADVANCED ? 6 : 4);
      setHasScrolledToBottom(false);
      setAgreementsChecked(false);
    }
  }, [state.currentStep, state.level]);

  // Reset slider position and dragging state on Step 2 load
  useEffect(() => {
    if (state.currentStep === 2) {
      setSliderPosition(0);
      setIsDraggingSlider(false);
    }
  }, [state.currentStep]);

  // Handle countdown on Step 1
  useEffect(() => {
    if (state.currentStep === 1 && agreementCountdown > 0) {
      const interval = setInterval(() => {
        setAgreementCountdown(c => c - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [state.currentStep, agreementCountdown]);

  // Handle countdown on Step 3 - SMS OTP
  useEffect(() => {
    if (otpSent && otpCountDown > 0) {
      const interval = setInterval(() => {
        setOtpCountDown(c => c - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (otpCountDown === 0) {
      setOtpSent(false);
      setOtpCountDown(60);
    }
  }, [otpSent, otpCountDown]);

  // Interactive liveness scanner simulation steps
  useEffect(() => {
    let interval: any;
    if (state.selectedMethod === VerificationMethod.LIVENESS_FACE && !state.isVerified) {
      interval = setInterval(() => {
        setLivenessTimer(t => {
          if (t <= 1) {
            if (livenessStage === 'blink') {
              onAddAuditLog('人脸活体核验', 'PENDING', '眨眼检测通过，下一步：张嘴检测...');
              setLivenessStage('mouth');
              return 3;
            } else if (livenessStage === 'mouth') {
              onAddAuditLog('人脸活体核验', 'PENDING', '张嘴检测通过，下一步：摇头检测...');
              setLivenessStage('nod');
              return 3;
            } else if (livenessStage === 'nod') {
              onAddAuditLog('人脸活体核验', 'SUCCESS', '实人活体检测与公安人脸特征库比对完全一致！');
              setLivenessStage('success');
              // Validate liveness face verification success
              setTimeout(() => {
                setState(prev => ({ ...prev, isVerified: true }));
                stopCamera();
              }, 1000);
              return 0;
            }
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [state.selectedMethod, livenessStage]);

  // Automatically bypass method selector in Step 3 for ADVANCED level
  useEffect(() => {
    if (state.currentStep === 3 && state.level === CertLevel.ADVANCED && state.selectedMethod !== VerificationMethod.LIVENESS_FACE && !state.isVerified) {
      setState(prev => ({ ...prev, selectedMethod: VerificationMethod.LIVENESS_FACE }));
      onAddAuditLog('安全合规审计', 'SUCCESS', '高级级别证书直接强制启用公安三维动态活人特征扫描');
    }
  }, [state.currentStep, state.level, state.selectedMethod, state.isVerified]);

  // 3. User actions & Flow mechanics
  const handleNextStep = () => {
    let next = state.currentStep + 1;
    
    // At Step 3 (Liveness Check / Card check):
    if (state.currentStep === 3) {
      if (state.level === CertLevel.BASIC) {
        // Basic Personal goes straight to issuance
        if (state.identityType === IdentityType.PERSONAL) {
          executeCertificateIssuance();
          return;
        }
        // Basic Corporate goes straight to Materials Upload / Sign (Step 5)
        next = 5;
      } else {
        // Advanced Personal skips Corporate Pay Verification (Step 4) and goes straight to Materials Upload / Sign (Step 5)
        if (state.identityType === IdentityType.PERSONAL) {
          next = 5;
        }
      }
    }
    
    // At Step 4 (Corporate Pay Verification):
    // Only Corporate Advanced goes through Step 4. When they complete/click Next, they go to Step 5 (Materials Upload / Sign).
    if (state.currentStep === 4) {
      next = 5;
    }
    
    // At Step 5 (Materials Upload / Sign):
    // - Basic Corporate has finished everything, so they go straight to issuance (Success - Step 7).
    // - Advanced levels (Personal & Corporate) proceed to Step 6 (Dual Recording).
    if (state.currentStep === 5) {
      if (state.level === CertLevel.BASIC) {
        executeCertificateIssuance();
        return;
      }
      next = 6;
    }

    // At Step 6 (Dual Recording):
    // - Advanced Personal and Advanced Corporate have finished everything after Dual Recording, so it goes to issuance.
    if (state.currentStep === 6) {
      onAddAuditLog('高级意愿存证', 'SUCCESS', '完成高级证书意愿声明自主朗读并绑定视频哈希成功。');
      executeCertificateIssuance();
      return;
    }

    onAddAuditLog(`流程流转`, 'SUCCESS', `流转到标准标准环节 ${next}: ` + getStepName(next));
    setState(prev => ({ ...prev, currentStep: next }));
  };

  const handlePrevStep = () => {
    if (state.currentStep > 1) {
      let prev = state.currentStep - 1;
      
      if (state.currentStep === 6) {
        prev = 5; // Advanced levels go back from Dual Recording (Step 6) to Materials Upload / Sign (Step 5)
      } else if (state.currentStep === 5) {
        if (state.level === CertLevel.BASIC) {
          prev = 3; // Basic Corporate goes back to Step 3
        } else {
          if (state.identityType === IdentityType.PERSONAL) {
            prev = 3; // Advanced Personal goes back directly to Step 3
          } else {
            prev = 4; // Advanced Corporate goes back to Step 4 (对公打款)
          }
        }
      }
      // If we go back from step 4 (对公打款), it goes back to 3
      
      onAddAuditLog(`流程回滚`, 'WARN', `用户返回上一步步骤 ${prev}`);
      setState(prev => ({ ...prev, currentStep: prev }));
    }
  };

  const getStepName = (step: number) => {
    const steps = [
      '',
      '风险告知 & 协议阅读',
      '流程启动 (基本核验)',
      '身份核验 & 进一步验证',
      '对公打款实控校验',
      '材料确认 & 协议签署',
      '高级意愿双录存证',
      '数字证书签发管理'
    ];
    return steps[step] || '办理主页';
  };

  // Slider dragging calculation
  const handleSliderMouseDown = (e: React.MouseEvent) => {
    setIsDraggingSlider(true);
  };

  const handleSliderTouchStart = (e: React.TouchEvent) => {
    setIsDraggingSlider(true);
  };

  useEffect(() => {
    const handleMove = (clientX: number) => {
      if (!isDraggingSlider || !sliderTrackRef.current || state.sliderPassed) return;
      const rect = sliderTrackRef.current.getBoundingClientRect();
      let pos = clientX - rect.left - 24; // 24 is half handle width
      const maxPos = rect.width - 48; // handle is 48px wide
      if (pos < 0) pos = 0;
      if (pos > maxPos) pos = maxPos;
      
      setSliderPosition(pos);
      
      // Unlock if dragged above 90%
      if (pos >= maxPos - 5) {
        setIsDraggingSlider(false);
        setSliderPosition(maxPos);
        setState(prev => ({ ...prev, sliderPassed: true }));
        onAddAuditLog('安全盾牌校验', 'SUCCESS', '滑动拼图人机安全校验通过');
      }
    };

    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches && e.touches[0]) {
        handleMove(e.touches[0].clientX);
      }
    };

    const handleUp = () => {
      if (isDraggingSlider) {
        setIsDraggingSlider(false);
        if (!state.sliderPassed) {
          setSliderPosition(0); // reset
        }
      }
    };

    if (isDraggingSlider) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [isDraggingSlider, state.sliderPassed]);

  // Form Field Updates
  const handleUpdateField = (field: string, val: string) => {
    setState(prev => ({ ...prev, [field]: val }));
  };

  // Submit Entrance Check (Step 1)
  const submitStep1 = () => {
    const isCorp = state.identityType !== IdentityType.PERSONAL;

    if (!state.fullName || !state.idCardNumber) {
      if (isCorp) {
        onAddAuditLog('安全盾牌校验', 'WARN', '工商登记核验：基本实名资料不完整，允许继续试用。');
      } else {
        alert('请完整填写申请人基本实名信息（用于公安留痕对比）');
        return;
      }
    }
    if (state.idCardNumber && state.idCardNumber.length !== 18) {
      if (isCorp) {
        onAddAuditLog('安全盾牌校验', 'WARN', '工商登记核验：身份证号格式非18位，系统转入人工比对并允许继续。');
      } else {
        alert('请输入合法的18位二代身份证号码');
        return;
      }
    }
    if (isCorp && (!state.companyName || !state.uscc)) {
      onAddAuditLog('安全盾牌校验', 'WARN', '工商四要素核验：企业名称或统一社会信用代码未完整填写，系统转入容错沙盒并允许继续。');
    }
    if (!state.sliderPassed) {
      alert('请向右滑动通过人机校验拼图');
      return;
    }

    const safeIdCard = state.idCardNumber ? `${state.idCardNumber.slice(0, 6)}...${state.idCardNumber.slice(-4)}` : '未填';
    onAddAuditLog('流程初始化', 'SUCCESS', `订户主体及实名资料备案已提交: ${state.fullName || '未填'} (${safeIdCard})`);
    handleNextStep();
  };

  // Start real web-cam or simulate liveness
  const startCamera = async () => {
    setCameraPermissionError(false);
    setCameraActive(true);
    setLivenessStage('blink');
    setLivenessTimer(3);
    
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        onAddAuditLog('摄像头启动', 'SUCCESS', '成功拉取本地视频流用作合规实人面部对比。');
      } else {
        throw new Error('getUserMedia not supported');
      }
    } catch (err) {
      console.warn('Camera failed to start, falling back to gorgeous simulation overlay', err);
      setCameraPermissionError(true);
      onAddAuditLog('人脸辅助系统', 'WARN', '环境不支持物理硬件检测，启用系统数字面部捕捉动画完成合规。');
    }
  };

  const stopCamera = () => {
    setCameraActive(false);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  // Trigger Operator 3-factor verification (SMS OTP code simulation)
  const sendSmsOtp = () => {
    if (!state.phoneNumber || state.phoneNumber.length !== 11) {
      alert('请输入合法的11位手机号码');
      return;
    }
    setOtpSent(true);
    setOtpCountDown(60);
    onAddAuditLog('发送验证码', 'PENDING', `系统向授权号码 ${state.phoneNumber} 投递合规一次性密码。`);
    // Auto-fill mock code after 1s for convenience
    setTimeout(() => {
      setState(prev => ({ ...prev, smsOtp: '8239' }));
      onAddAuditLog('网络网关通知', 'SUCCESS', '验证码投递成功。默认自动填充模拟验证码: 8239');
    }, 1200);
  };

  const verifySmsCode = () => {
    if (state.smsOtp !== '8239') {
      const nextAttempts = state.verifyAttempts + 1;
      onAddAuditLog('运营商三要素核验', 'FAILED', `验证码校验不匹配，累计失败次数：${nextAttempts}/3`);
      
      if (nextAttempts >= state.maxAttempts) {
        setState(prev => ({ 
          ...prev, 
          verifyAttempts: nextAttempts,
          flowStatus: 'MANUAL_AUDIT_PENDING',
          currentStep: 3 
        }));
        onAddAuditLog('安全规则处罚', 'WARN', '线上核验失败达上限（3次），线上通道已锁，业务强装流转至人工复核。');
      } else {
        setState(prev => ({ ...prev, verifyAttempts: nextAttempts }));
        alert('验证码输入错误，请重新输入！');
      }
    } else {
      onAddAuditLog('运营商三要素核验', 'SUCCESS', `运营商在网状态比对通过。姓名、手机号、二代身份证数据库三要素一致。`);
      setState(prev => ({ ...prev, isVerified: true, verifyAttempts: 0 }));
    }
  };

  // Skip or Verify Bank 4 factors
  const verifyBank4 = () => {
    if (!state.bankCardNumber || state.bankCardNumber.length < 15) {
      alert('请输入正确的银行储蓄卡卡号 (用于合规要素比对)');
      return;
    }
    onAddAuditLog('银联四要素核验', 'SUCCESS', '银行卡信息比对合法。核验姓名、身份证、卡号及预留手机相符。');
    setState(prev => ({ ...prev, isVerified: true }));
  };

  // Verify Corporate Micro Penny transfer (Step 4 Corp Agent exclusive)
  const verifyCorpTransfer = () => {
    if (Number(state.inputMicroAmount) === Number(state.sentMicroAmount)) {
      onAddAuditLog('企业对公打款核验', 'SUCCESS', `法定机构对公账户持有及控制权校验成功 (一致打款核对数: ¥${state.inputMicroAmount})`);
      handleNextStep();
    } else {
      onAddAuditLog('企业对公打款核验', 'FAILED', `输入的对公验证金额不匹配。输入的数值: ¥${state.inputMicroAmount} (期望值: ¥${state.sentMicroAmount})`);
      alert('打款验证金额不符，请核实公司银行流水打款数目！您可以随时在右侧安全面板“打款测试沙盒”查看当前模拟到账数。');
    }
  };

  // Draw Handwritten Signature
  const startDrawingSig = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawingSignature(true);
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set line params
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000000';

    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const drawSignature = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingSignature) return;
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawingSig = () => {
    setIsDrawingSignature(false);
  };

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setState(prev => ({ ...prev, signatureDone: false, signatureDataUrl: undefined }));
    onAddAuditLog('撤销签名', 'WARN', '订户撤销了本次画板签名重新签署');
  };

  const saveSignature = () => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    setState(prev => ({ ...prev, signatureDone: true, signatureDataUrl: dataUrl }));
    onAddAuditLog('签署电子服务协议', 'SUCCESS', '手写电子印模签署已绑定归档。《数字证书技术认证合同》生效。');
  };

  // Mock Document upload
  const simulateFileUpload = (type: 'BUSINESS_LICENSE' | 'LEGAL_AUTH_LETTER' | 'SEALED_AGREEMENT' | 'ID_FRONT' | 'ID_BACK') => {
    const randomId = Math.random().toString(36).substring(7);
    const mockFiles = {
      BUSINESS_LICENSE: '91310000MA_营业执照_已扫描.jpeg',
      LEGAL_AUTH_LETTER: '企业数字证书法人特别授权签署书_盖章本.pdf',
      SEALED_AGREEMENT: '电子认证服务协议_公章本.pdf',
      ID_FRONT: '经办人身份证正印照_公安归档本.png',
      ID_BACK: '经办人身份证反面照.png'
    };

    const newFile = {
      id: randomId,
      name: mockFiles[type],
      type,
      previewUrl: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=200&auto=format&fit=crop'
    };

    setState(prev => ({
      ...prev,
      uploadedFiles: [...prev.uploadedFiles.filter(f => f.type !== type), newFile]
    }));

    onAddAuditLog('合规要件上传', 'SUCCESS', `上传并校验了文档：${mockFiles[type]} (哈希散列校验合规)`);
  };

  const executeCertificateIssuance = () => {
    onAddAuditLog('数字密钥对签发', 'PENDING', '正在生成SM2/ECC客户端随机密钥向量值...');
    
    setTimeout(() => {
      onAddAuditLog('加密芯片分级加密', 'SUCCESS', `私钥建立受到安全体系保管与托管。`);
      onAddAuditLog('高法律效力凭证颁发', 'SUCCESS', `CA颁发成功，证书系列标识代码: 202606_${Math.random().toString().slice(2, 14)}`);
      
      // Issue certificate in system database
      onIssueCertificate({
        ownerName: state.fullName,
        companyName: state.identityType !== IdentityType.PERSONAL ? state.companyName : undefined,
        uscc: state.identityType !== IdentityType.PERSONAL ? state.uscc : undefined,
      });

      setState(prev => ({
        ...prev,
        currentStep: 7,
        flowStatus: 'SUCCESS'
      }));
    }, 2000);
  };

  // Helper to check if file type uploaded
  const hasUploaded = (type: string) => {
    return state.uploadedFiles.some(f => f.type === type);
  };

  // Manual Review Trigger
  const submitManualReview = () => {
    setState(prev => ({
      ...prev,
      flowStatus: 'MANUAL_AUDIT_PENDING',
      currentStep: 7,
    }));
    onAddAuditLog('业务状态流转', 'PENDING', '已发起高等级人工核查，等待管理员核验资质原件与二代防伪标记。');
  };

  return (
    <div className="flex justify-center items-center p-2 relative" id="simulator-container">
      {/* Flat simulated view container */}
      <div className="relative w-[360px] h-[720px] bg-white border border-[#DEE3EA] shadow-md flex flex-col pt-2 pb-4 select-none relative overflow-hidden text-slate-800 rounded-none shrink-0">
          
          {/* Top Status Bar Simulator */}
          <div className="px-5 pt-0 pb-1 flex justify-between items-center text-[10px] font-sans font-bold text-slate-500 z-40 bg-white">
            <span>09:41</span>
            <div className="flex items-center gap-1.5">
              <span>5G</span>
              <div className="w-5 h-2.5 border border-slate-400 rounded-none p-0.5 flex">
                <div className="h-full w-4/5 bg-slate-400 rounded-none"></div>
              </div>
            </div>
          </div>

          {/* Core Navigation Standard Header */}
          <div className="bg-white border-b border-[#E2E8F0] px-4 py-2.5 flex items-center justify-between z-30 shrink-0">
            {state.currentStep > 1 && state.currentStep < 7 ? (
              <button 
                onClick={handlePrevStep}
                className="text-slate-600 hover:text-[#0D5EFA] flex items-center text-xs font-sans font-medium"
              >
                ‹ 返回
              </button>
            ) : (
              <div className="w-8"></div>
            )}
            <div className="text-center flex-1">
              <span className="text-[14px] font-bold text-[#333333] tracking-normal">{getHeaderTitle()}</span>
            </div>
            <div className="w-8"></div>
          </div>

          {/* MAIN INTERACTIVE AREA: STEP SCREENS SCREEN */}
          <div className="flex-1 overflow-y-auto bg-[#F5F6F8] flex flex-col relative">

            {/* ERROR LIMIT REACTION: FORCED TO MANUAL REVIEW */}
            {state.flowStatus === 'MANUAL_AUDIT_PENDING' && state.currentStep !== 7 && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="flex-1 flex flex-col justify-center text-center space-y-4"
              >
                <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-600 shadow-sm">
                  <AlertCircle size={32} />
                </div>
                <h3 className="text-sm font-bold text-slate-950 font-sans tracking-tight">线上审核通道已熔断关闭</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                  检测到线上校验失败次数：<span className="text-red-500 font-bold">3/3 次</span>。
                  根据合规标准规范2.4.4，达到最多次限制后将自动锁定线上入口，仅支持线下人工客服柜面核对。
                </p>

                <div className="bg-slate-100 p-3 rounded-lg border border-slate-200 text-left space-y-2 text-[11px]">
                  <span className="font-semibold block text-slate-800">请点选上传证明并转派人工：</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => simulateFileUpload('ID_FRONT')}
                      className={`py-2 rounded border text-center transition flex flex-col items-center gap-1 bg-white hover:bg-slate-50 ${
                        hasUploaded('ID_FRONT') ? 'border-green-600 text-green-700' : 'border-slate-350 text-slate-600'
                      }`}
                    >
                      <Upload size={12} />
                      <span>{hasUploaded('ID_FRONT') ? '✓ 证件面完成' : '上传身份证正面'}</span>
                    </button>
                    <button 
                      onClick={() => simulateFileUpload('ID_BACK')}
                      className={`py-2 rounded border text-center transition flex flex-col items-center gap-1 bg-white hover:bg-slate-50 ${
                        hasUploaded('ID_BACK') ? 'border-green-600 text-green-700' : 'border-slate-350 text-slate-600'
                      }`}
                    >
                      <Upload size={12} />
                      <span>{hasUploaded('ID_BACK') ? '✓ 证件反完成' : '上传身份证反面'}</span>
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={submitManualReview}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 rounded-lg text-xs"
                    id="btn-force-manual"
                  >
                    确认转人工审核 (预计1-2h)
                  </button>
                  <button
                    onClick={() => setState(prev => ({ ...prev, verifyAttempts: 0, flowStatus: 'PROCESSING', currentStep: 1 }))}
                    className="w-full mt-2 text-xs text-slate-400 hover:text-slate-600"
                  >
                    返回主页重试
                  </button>
                </div>
              </motion.div>
            )}

            {state.flowStatus !== 'MANUAL_AUDIT_PENDING' && (
              <AnimatePresence mode="wait">
                
                {/* STEP 2: 流程启动 (Entrance Form + Slider Security check) */}
                {state.currentStep === 2 && (
                  <motion.div 
                    key="step2" 
                    initial={{ opacity: 0, x: 20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    exit={{ x: -20, opacity: 0 }}
                    className="flex-1 flex flex-col"
                  >
                    <div className="bg-[#EAF3FE] px-4 py-3 flex items-center justify-center gap-2 border-b border-blue-100 shrink-0">
                      <Check className="text-emerald-500 bg-white rounded-full p-0.5" size={14} strokeWidth={3} />
                      <span className="text-[10px] text-[#0D5EFA] font-medium leading-normal">
                        您的信息全程加密传输，安全无忧！
                      </span>
                    </div>

                    {state.identityType === IdentityType.PERSONAL ? (
                      <div className="bg-white mb-2">
                        <div className="flex justify-between items-center px-4 py-3 text-[14px]">
                          <span>个人信息 <span className="text-red-500">*</span></span>
                          <button 
                            type="button"
                            onClick={() => setState(prev => ({ 
                              ...prev, 
                              fullName: '华仔特警',
                              idCardNumber: '310115199203140510',
                              phoneNumber: '13812345678'
                            }))}
                            className="text-[#0D5EFA] text-xs font-medium"
                          >
                            填入样例数据
                          </button>
                        </div>
                        <div className="px-4">
                          <div className="flex items-center justify-between py-4 border-t border-slate-100">
                            <span className="text-[14px] text-[#333333]">姓名</span>
                            <input 
                              type="text"
                              value={state.fullName}
                              onChange={(e) => handleUpdateField('fullName', e.target.value)}
                              placeholder="请输入真实姓名"
                              className="w-2/3 bg-transparent text-right text-[14px] outline-none text-[#333333] placeholder-slate-300"
                              id="input-fullname"
                            />
                          </div>
                          <div className="flex items-center justify-between py-4 border-t border-slate-100">
                            <span className="text-[14px] text-[#333333]">身份证号</span>
                            <input 
                              type="text"
                              value={state.idCardNumber}
                              onChange={(e) => handleUpdateField('idCardNumber', e.target.value)}
                              placeholder="请输入18位身份证号"
                              maxLength={18}
                              className="w-2/3 bg-transparent text-right text-[14px] outline-none text-[#333333] placeholder-slate-300"
                              id="input-idcard"
                            />
                          </div>
                          <div className="flex items-center justify-between py-4 border-t border-slate-100">
                            <span className="text-[14px] text-[#333333]">手机号码</span>
                            <input 
                              type="text"
                              value={state.phoneNumber}
                              onChange={(e) => handleUpdateField('phoneNumber', e.target.value)}
                              placeholder="请输入11位手机号码"
                              maxLength={11}
                              className="w-2/3 bg-transparent text-right text-[14px] outline-none text-[#333333] placeholder-slate-300"
                              id="input-phone"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-2">
                        <div className="bg-white mb-2 pt-1 pb-1">
                          <div className="flex justify-between items-center px-4 py-3 text-[14px]">
                            <span>企业信息 <span className="text-red-500">*</span></span>
                            <button 
                              type="button"
                              onClick={() => {
                                if (state.identityType === IdentityType.CORP_LEGAL) {
                                  setState(prev => ({ 
                                    ...prev, 
                                    companyName: '华夏建筑工程集团有限公司',
                                    uscc: '91310000MA1FL4TW7Y',
                                    fullName: '张华夏',
                                    idCardNumber: '310115197805121021',
                                    legalRepName: '张华夏',
                                    legalRepIdCard: '310115197805121021',
                                    phoneNumber: '15912345678'
                                  }));
                                } else {
                                  setState(prev => ({ 
                                    ...prev, 
                                    companyName: '中金金融认证中心有限公司',
                                    uscc: '91110000759626025U',
                                    fullName: '刘经办',
                                    idCardNumber: '310115199508125439',
                                    legalRepName: '刘先亮',
                                    legalRepIdCard: '110101198402220021',
                                    phoneNumber: '13812345678'
                                  }));
                                }
                              }}
                              className="text-[#0D5EFA] text-xs font-medium"
                            >
                              填入样例数据
                            </button>
                          </div>
                          <div className="px-4">
                            <div className="flex items-center justify-between py-4 border-t border-slate-100">
                              <span className="text-[14px] text-[#333333]">企业名称</span>
                              <input 
                                type="text"
                                value={state.companyName || ''}
                                onChange={(e) => handleUpdateField('companyName', e.target.value)}
                                placeholder="请输入营业执照注册企业全称"
                                className="w-2/3 bg-transparent text-right text-[14px] outline-none text-[#333333] placeholder-slate-300"
                              />
                            </div>
                            <div className="flex items-center justify-between py-4 border-t border-slate-100">
                              <span className="text-[14px] text-[#333333]">统一社会信用代码</span>
                              <input 
                                type="text"
                                value={state.uscc || ''}
                                onChange={(e) => handleUpdateField('uscc', e.target.value)}
                                placeholder="请输入代码"
                                className="w-2/3 bg-transparent text-right text-[14px] outline-none text-[#333333] placeholder-slate-300"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="bg-white mb-2 pt-1 pb-1">
                          <div className="flex justify-between items-center px-4 py-3 text-[14px]">
                            <span>法定代表人信息 <span className="text-red-500">*</span></span>
                          </div>
                          <div className="px-4">
                            <div className="flex items-center justify-between py-4 border-t border-slate-100">
                              <span className="text-[14px] text-[#333333]">法人姓名</span>
                              <input 
                                type="text"
                                value={state.identityType === IdentityType.CORP_LEGAL ? (state.fullName || '') : (state.legalRepName || '')}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (state.identityType === IdentityType.CORP_LEGAL) {
                                    setState(prev => ({ ...prev, fullName: val, legalRepName: val }));
                                  } else {
                                    handleUpdateField('legalRepName', val);
                                  }
                                }}
                                placeholder="请输入姓名"
                                className="w-2/3 bg-transparent text-right text-[14px] outline-none text-[#333333] placeholder-slate-300"
                              />
                            </div>
                            <div className="flex items-center justify-between py-4 border-t border-slate-100">
                              <span className="text-[14px] text-[#333333]">证件号码</span>
                              <input 
                                type="text"
                                value={state.identityType === IdentityType.CORP_LEGAL ? (state.idCardNumber || '') : (state.legalRepIdCard || '')}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (state.identityType === IdentityType.CORP_LEGAL) {
                                    setState(prev => ({ ...prev, idCardNumber: val, legalRepIdCard: val }));
                                  } else {
                                    handleUpdateField('legalRepIdCard', val);
                                  }
                                }}
                                placeholder="请输入18位身份证号"
                                className="w-2/3 bg-transparent text-right text-[14px] outline-none text-[#333333] placeholder-slate-300"
                              />
                            </div>
                            {state.identityType === IdentityType.CORP_LEGAL && (
                              <div className="flex items-center justify-between py-4 border-t border-slate-100">
                                <span className="text-[14px] text-[#333333]">手机号码</span>
                                <input 
                                  type="text"
                                  value={state.phoneNumber || ''}
                                  onChange={(e) => handleUpdateField('phoneNumber', e.target.value)}
                                  placeholder="请输入法人手机号码"
                                  maxLength={11}
                                  className="w-2/3 bg-transparent text-right text-[14px] outline-none text-[#333333] placeholder-slate-300"
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        {state.identityType === IdentityType.CORP_AGENT && (
                          <div className="bg-white mb-2 pt-1 pb-1">
                            <div className="flex justify-between items-center px-4 py-3 text-[14px]">
                              <span>经办人信息 <span className="text-red-500">*</span></span>
                            </div>
                            <div className="px-4">
                              <div className="flex items-center justify-between py-4 border-t border-slate-100">
                                <span className="text-[14px] text-[#333333]">经办人姓名</span>
                                <input 
                                  type="text"
                                  value={state.fullName || ''}
                                  onChange={(e) => handleUpdateField('fullName', e.target.value)}
                                  placeholder="请输入姓名"
                                  className="w-2/3 bg-transparent text-right text-[14px] outline-none text-[#333333] placeholder-slate-300"
                                />
                              </div>
                              <div className="flex items-center justify-between py-4 border-t border-slate-100">
                                <span className="text-[14px] text-[#333333]">经办人证件</span>
                                <input 
                                  type="text"
                                  value={state.idCardNumber || ''}
                                  onChange={(e) => handleUpdateField('idCardNumber', e.target.value)}
                                  placeholder="请输入18位身份证号"
                                  className="w-2/3 bg-transparent text-right text-[14px] outline-none text-[#333333] placeholder-slate-300"
                                />
                              </div>
                              <div className="flex items-center justify-between py-4 border-t border-slate-100">
                                <span className="text-[14px] text-[#333333]">手机号码</span>
                                <input 
                                  type="text"
                                  value={state.phoneNumber || ''}
                                  onChange={(e) => handleUpdateField('phoneNumber', e.target.value)}
                                  placeholder="请输入经办人手机号码"
                                  maxLength={11}
                                  className="w-2/3 bg-transparent text-right text-[14px] outline-none text-[#333333] placeholder-slate-300"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 安全人机防攻行为校验 slider shifted to flow under the input fields */}
                    <div className="bg-white mb-2 px-4 py-4">
                      <div className="flex justify-between items-center text-[10px] text-slate-655 font-sans mb-3">
                        <span className="font-medium text-slate-500">🔒 安全人机防攻行为校验</span>
                        <span className={state.sliderPassed ? 'text-green-600 font-medium' : 'text-[#0D5EFA] font-medium'}>
                          {state.sliderPassed ? '重力感应校验成功' : '向右滑动滑块'}
                        </span>
                      </div>
                      <div 
                        ref={sliderTrackRef}
                        className={`relative h-10 rounded-sm overflow-hidden transition-all duration-300 ${
                          state.sliderPassed ? 'bg-[#EAF3FE] text-[#0D5EFA]' : 'bg-[#F5F6F8] text-slate-400'
                        }`}
                        id="slider-container"
                      >
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none text-[12px]">
                          {state.sliderPassed ? '✓ 校验通过' : '>>>>>> 向右滑动滑块完成验证'}
                        </div>
                        {!state.sliderPassed && (
                          <div 
                            className="absolute left-0 top-0 h-full w-10 bg-[#0D5EFA] shadow-[0_2px_4px_rgba(13,94,250,0.3)] flex items-center justify-center cursor-grab active:cursor-grabbing text-white"
                            style={{ transform: `translateX(${sliderPosition}px)` }}
                            onMouseDown={handleSliderMouseDown}
                            onTouchStart={handleSliderTouchStart}
                            id="slider-handle"
                          >
                            <ArrowRight size={14} />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Sticky Footer */}
                    <div className="sticky bottom-0 mt-auto w-full bg-white border-t border-slate-100 flex flex-col z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
                      <div className="px-4 py-3">
                        <button
                          onClick={submitStep1}
                          className="w-full bg-[#0D5EFA] hover:bg-[#0b51d6] text-white py-2.5 rounded-full text-[14px]"
                          id="btn-step1-submit"
                        >
                          下一步
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}


                {/* STEP 1: 风险告知 & 协议阅读 (Forced Read with Countdown Timer) */}
                {state.currentStep === 1 && (
                  <motion.div 
                    key="step1" 
                    initial={{ opacity: 0, x: 20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    exit={{ opacity: -20 }}
                    className="flex-1 flex flex-col"
                  >
                    <div className="bg-[#EAF3FE] text-[#333333] px-4 py-3 border-b border-blue-100 flex items-center gap-2 relative">
                      <Shield size={14} className="text-[#0D5EFA] shrink-0" />
                      <div className="flex-1">
                        <span className="font-medium text-[12px] block text-[#0D5EFA] mb-0.5">CA 电子认证主体权限制告知书</span>
                        <span className="text-[10px] text-slate-500 leading-normal block">
                          您正在办理 [{state.level === CertLevel.ADVANCED ? '高级版数字证书' : '基础版数字证书'}]
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-white mb-2 pt-3 pb-3">
                      <div className="px-4 space-y-2">
                        <div className="text-[10px] text-slate-500 space-y-1 bg-[#F5F6F8] p-3 rounded-sm leading-relaxed">
                          <p>● 基础级适用：普通文签、系统认证登记、低风险政务备案。</p>
                          <p>● <span className="text-amber-600 font-bold">基础级禁用：严禁用于任何招投标、不动产过户、以及超20万元高风险金融签署。</span></p>
                          <p>● 高级级适用：全场景兼容，包括国家标准招投标、大型资产保理及正式政务电子盖签。</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white px-4 py-4 mb-2 flex-1 relative">
                      <div className="font-bold text-[#333333] block border-b border-slate-100 pb-2 mb-3 text-[14px]">《电子认证服务协议与隐私条款》条例精选</div>
                      <div 
                        onScroll={(e) => {
                          const target = e.currentTarget;
                          if (target.scrollHeight - target.scrollTop <= target.clientHeight + 8) {
                            if (!hasScrolledToBottom) {
                              setHasScrolledToBottom(true);
                              onAddAuditLog('阅读流控', 'SUCCESS', '协议成功阅读到底部，安全强制门禁解锁。');
                            }
                          }
                        }}
                        className="max-h-[220px] overflow-y-auto space-y-3 text-[12px] text-slate-500 leading-relaxed"
                      >
                        <p>1. 订户应当妥善保管本人数字证书私钥及安全存储PIN密码。任何因泄露密码、委托他人代为保管、或设备遗失后未及时挂失所导致的法律后果，需由订户自行承担责任。</p>
                        <p>2. 根据《中华人民共和国电子签名法》，使用本电子证书生成的数字签名具备完全的国家法制证明效力，等同于手写签名 and 加盖实体公章。</p>
                        <p>3. 办理人点击同意即代表授权CA中心和国家权威核验网关进行相应行为的可追溯存证。</p>
                        {/* Fill up space to make scrolling visible */}
                        <p>4. 数字证书不得转让、借用、出租或出售给他人。否则，引起的后果及赔偿责任概由原证书主体承担。</p>
                        <p>5. 对于通过密码校验后产生的任何签名行为，均视作证书主体的真实有效意愿表达。</p>
                        <p>6. 当数字证书由于某些原因不再适用时，订户应当立刻在安全设备终端点击“撤销凭证”，或立刻前往CA中心官网申请废止证书。</p>
                      </div>

                      {!hasScrolledToBottom && (
                        <div className="absolute bottom-4 left-4 right-4 bg-amber-50 text-amber-600 border border-amber-200 text-[10px] px-3 py-2 rounded animate-pulse font-bold text-center">
                          ⬇ 请须向下滚动阅读到底部以激活确认
                        </div>
                      )}
                    </div>

                    <div className={`bg-white px-4 py-3 flex flex-col gap-2 relative z-10 transition-colors ${
                      !hasScrolledToBottom ? 'bg-amber-50/20' : (agreementCountdown > 0 ? 'bg-blue-50/20' : '')
                    }`}>
                      <div className="flex items-start gap-2">
                        <input 
                          type="checkbox"
                          checked={agreementsChecked}
                          disabled={agreementCountdown > 0 || !hasScrolledToBottom}
                          onChange={(e) => setAgreementsChecked(e.target.checked)}
                          className="mt-0.5 h-4 w-4 text-[#0D5EFA] outline-none cursor-pointer rounded-sm border-slate-300"
                          id="cb-protocol"
                        />
                        <label className={`text-[12px] leading-relaxed ${
                          agreementCountdown > 0 || !hasScrolledToBottom 
                            ? 'text-slate-400' 
                            : 'text-[#333333] font-medium'
                        }`}>
                          我已认真阅读并在最底部确认承担全部隐私限制、合规责任与法律义务。
                        </label>
                      </div>

                      {/* Interactive Countdown & Status Badges */}
                      <div className="text-[10px] font-medium pl-6">
                        {!hasScrolledToBottom ? (
                          <span className="text-amber-600">
                            请下拉滑到底部以激活确认框 ⬇️
                          </span>
                        ) : agreementCountdown > 0 ? (
                          <span className="text-[#0D5EFA]">
                            强制阅读防秒过倒计时：{agreementCountdown} 秒
                          </span>
                        ) : (
                          <span className="text-emerald-500">
                            ✓ 满足5s必读时间，现在可以勾选并通过
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Sticky Footer */}
                    <div className="sticky bottom-0 mt-auto w-full bg-white border-t border-slate-100 px-4 py-3 flex gap-4 z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
                      <button
                        onClick={handleNextStep}
                        disabled={!agreementsChecked || agreementCountdown > 0 || !hasScrolledToBottom}
                        className={`w-full font-semibold py-2.5 rounded-full text-[14px] transition duration-200 ${
                          agreementsChecked && agreementCountdown === 0 && hasScrolledToBottom
                            ? 'bg-[#0D5EFA] hover:bg-[#0b51d6] text-white shadow-lg shadow-blue-100' 
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                        id="btn-agree-continue"
                      >
                        {(!hasScrolledToBottom) 
                          ? '请下拉至底部阅读' 
                          : (agreementCountdown > 0)
                            ? `请阅读并等待 (${agreementCountdown}s)` 
                            : '已阅读，下一步'
                        }
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: 身份核验 & 意愿确认 (Branch based on CertLevel, with SMS OTP, Liveness or Bank Card Verification) */}
                {state.currentStep === 3 && (
                  <motion.div 
                    key="step3" 
                    initial={{ opacity: 0, x: 20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    exit={{ opacity: -20 }}
                    className="flex-1 flex flex-col"
                  >
                    <div className="bg-white mb-2 pt-1 pb-1">
                      <div className="px-4 py-3 flex justify-between items-center bg-[#EAF3FE] text-[#333333] border-b border-blue-100">
                        <div>
                          <span className="text-[10px] text-slate-500 block font-sans mb-0.5">申请主体实名资料：</span>
                          <span className="font-bold text-[#333333] text-[14px]">{state.fullName}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 block mb-0.5">身份证：</span>
                          <span className="font-mono text-[#333333] text-[14px]">
                            {state.idCardNumber.slice(0, 4)}**********{state.idCardNumber.slice(-4)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* METHOD SELECTOR PANEL */}
                    {!state.selectedMethod && !state.isVerified && state.level !== CertLevel.ADVANCED && (
                      <div className="bg-white px-4 py-3 mb-2 flex-1">
                        <span className="text-[14px] font-bold text-[#333333] block mb-3 border-b border-slate-100 pb-2">请选择实人身份核验渠道</span>
                        
                        <div className="flex flex-col">
                          {/* 1. SMS OTP 3 Factor Verification */}
                          <div 
                            className={`py-4 border-b border-slate-100 transition ${
                              state.level === CertLevel.ADVANCED 
                                ? 'opacity-60 cursor-not-allowed' 
                                : 'cursor-pointer hover:bg-slate-50 -mx-4 px-4'
                            }`}
                            onClick={() => {
                              if (state.level === CertLevel.ADVANCED) {
                                onAddAuditLog('核验等级违规拦截', 'WARN', '高级别证书强制杜绝“运营商短信简易核验”方式（防范借卡洗钱及空号绕过）。');
                                alert('政策合规提醒：个人高级数字证书禁止降级使用简易验证！必须采用活体人脸视频。');
                                return;
                              }
                              setState(prev => ({ ...prev, selectedMethod: VerificationMethod.OPERATOR_3_FACTOR }));
                              onAddAuditLog('核验方式选择', 'PENDING', '用户选择：运营商三要素极速校验');
                            }}
                            id="method-sms"
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex gap-3">
                                <Phone size={20} className="text-[#0D5EFA]" />
                                <div>
                                  <span className="text-[14px] font-bold text-[#333333] block">运营商在网三要素核验</span>
                                  <p className="text-[10px] text-slate-400 mt-1">姓名、身份代号、预留指纹手机一致性验证</p>
                                </div>
                              </div>
                              {state.level === CertLevel.ADVANCED ? (
                                <span className="text-[10px] px-2 py-0.5 bg-red-100 text-red-600 rounded">高级禁用</span>
                              ) : (
                                <ChevronRight size={16} className="text-slate-300" />
                              )}
                            </div>
                          </div>

                          {/* 2. Bank 4 Factor Verification */}
                          <div 
                            className={`py-4 border-b border-slate-100 transition ${
                              state.level === CertLevel.ADVANCED 
                                ? 'opacity-60 cursor-not-allowed' 
                                : 'cursor-pointer hover:bg-slate-50 -mx-4 px-4'
                            }`}
                            onClick={() => {
                              if (state.level === CertLevel.ADVANCED) {
                                onAddAuditLog('核验等级违规拦截', 'WARN', '高级别证书禁止使用银行卡简易四要素。');
                                alert('政策合规提醒：高级数字证书禁止降级使用银行四要素！必须采用最高等级活体实人。');
                                return;
                              }
                              setState(prev => ({ ...prev, selectedMethod: VerificationMethod.BANK_4_FACTOR }));
                              onAddAuditLog('核验方式选择', 'PENDING', '用户选择：储蓄卡四要素联立比对');
                            }}
                            id="method-bank"
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex gap-3">
                                <Key size={20} className="text-[#0D5EFA]" />
                                <div>
                                  <span className="text-[14px] font-bold text-[#333333] block">银联金卡四要素确认</span>
                                  <p className="text-[10px] text-slate-400 mt-1">绑定姓名、储蓄卡、预留手机完成网银交叉核实</p>
                                </div>
                              </div>
                              {state.level === CertLevel.ADVANCED ? (
                                <span className="text-[10px] px-2 py-0.5 bg-red-100 text-red-600 rounded">高级禁用</span>
                              ) : (
                                <ChevronRight size={16} className="text-slate-300" />
                              )}
                            </div>
                          </div>

                          {/* 3. Liveness Face Scan (Required/Unlocked for Advanced) */}
                          <div 
                            className="py-4 transition cursor-pointer hover:bg-slate-50 -mx-4 px-4"
                            onClick={() => {
                              setState(prev => ({ ...prev, selectedMethod: VerificationMethod.LIVENESS_FACE }));
                              onAddAuditLog('核验方式选择', 'PENDING', '用户启动：生物特征人脸三维深度活体合规认证。');
                              startCamera();
                            }}
                            id="method-camera"
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex gap-3">
                                <Camera size={20} className="text-[#0D5EFA]" />
                                <div>
                                  <span className="text-[14px] font-bold text-[#333333] block flex items-center gap-1.5">
                                    公安部生物人脸活体核验
                                    <span className="text-[10px] px-1.5 py-px border border-green-200 bg-green-50 text-green-600 rounded font-normal">推荐</span>
                                  </span>
                                  <p className="text-[10px] text-slate-400 mt-1">采集现场面部动态微特征，直接比对公安底片</p>
                                </div>
                              </div>
                              {state.level === CertLevel.ADVANCED ? (
                                <span className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-700 rounded font-bold font-sans">强合规专属</span>
                              ) : (
                                <ChevronRight size={16} className="text-slate-300" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                      {/* RE-ENTRY CHANNELS FOR SUB-METHODS */}
                      
                      {/* SMS Verification screen */}
                      {state.selectedMethod === VerificationMethod.OPERATOR_3_FACTOR && !state.isVerified && (
                        <div className="bg-white px-4 py-4 mb-2 flex-1">
                          <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-3">
                            <span className="text-[14px] font-bold text-[#333333]">运营商三要素快速核实</span>
                            <button 
                              onClick={() => setState(prev => ({ ...prev, selectedMethod: null }))}
                              className="text-[10px] text-slate-400 hover:text-[#0D5EFA]"
                            >
                              更换方式
                            </button>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <span className="text-[12px] text-slate-500 block mb-1">注册在网的实名手机号码 (11位)</span>
                              <input 
                                type="text"
                                value={state.phoneNumber}
                                onChange={(e) => handleUpdateField('phoneNumber', e.target.value)}
                                placeholder="请输入11位个人在网手机号"
                                maxLength={11}
                                className="w-full bg-[#F5F6F8] rounded p-3 outline-none font-mono text-[14px] text-[#333333]"
                                id="input-sms-phone"
                              />
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                              <div className="col-span-2">
                                <span className="text-[12px] text-slate-500 block mb-1">输入验证码</span>
                                <input 
                                  type="text"
                                  value={state.smsOtp}
                                  onChange={(e) => handleUpdateField('smsOtp', e.target.value)}
                                  placeholder="4位口令"
                                  className="w-full bg-[#F5F6F8] rounded p-3 outline-none text-center font-mono tracking-widest text-[16px] font-bold text-[#333333]"
                                  id="input-sms-otp"
                                />
                              </div>
                              <div className="flex items-end">
                                <button
                                  type="button"
                                  onClick={sendSmsOtp}
                                  disabled={otpSent}
                                  className={`w-full h-[46px] text-[12px] rounded font-medium ${
                                    otpSent 
                                      ? 'bg-slate-100 text-slate-400' 
                                      : 'bg-[#EAF3FE] text-[#0D5EFA]'
                                  }`}
                                  id="btn-send-sms"
                                >
                                  {otpSent ? `${otpCountDown}s后重发` : '获取验证码'}
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Simulation Helpers to fail */}
                          <div className="flex justify-between items-center text-[10px] pt-4 mt-4 text-slate-400 border-t border-slate-100">
                            <span>已失败试错数：{state.verifyAttempts} / 3 次</span>
                            <button
                              onClick={() => {
                                handleUpdateField('smsOtp', '9999'); // wrong code on purpose
                                onAddAuditLog('安全联防机制测试', 'WARN', '输入了错误的短信OTP，供失败次数上限容错机制测试。');
                              }}
                              className="text-amber-500 hover:underline"
                            >
                              填错误码测试锁定
                            </button>
                          </div>

                          <button
                            onClick={verifySmsCode}
                            className="w-full bg-[#0D5EFA] text-white font-medium py-3 rounded-full text-[14px] mt-6"
                            id="btn-verify-sms"
                          >
                            核验手机通信密匙
                          </button>
                        </div>
                      )}

                      {/* Bank card verification screen */}
                      {state.selectedMethod === VerificationMethod.BANK_4_FACTOR && !state.isVerified && (
                        <div className="bg-white px-4 py-4 mb-2 flex-1">
                          <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-3">
                            <span className="text-[14px] font-bold text-[#333333]">银联金卡绑定实名核证</span>
                            <button 
                              onClick={() => setState(prev => ({ ...prev, selectedMethod: null }))}
                              className="text-[10px] text-slate-400 hover:text-[#0D5EFA]"
                            >
                              更换方式
                            </button>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <span className="text-[12px] text-slate-500 block mb-1">开户行预留手机号</span>
                              <input 
                                type="text"
                                value={state.phoneNumber}
                                onChange={(e) => handleUpdateField('phoneNumber', e.target.value)}
                                placeholder="138xxxxxxxx"
                                className="w-full bg-[#F5F6F8] rounded p-3 outline-none font-mono text-[14px] text-[#333333]"
                                id="input-bank-phone"
                              />
                            </div>
                            <div>
                              <span className="text-[12px] text-slate-500 block mb-1">16-19位大陆商业银行储蓄卡号</span>
                              <div className="flex gap-2">
                                <input 
                                  type="text"
                                  value={state.bankCardNumber}
                                  onChange={(e) => handleUpdateField('bankCardNumber', e.target.value)}
                                  placeholder="622或621开头卡号"
                                  className="w-full bg-[#F5F6F8] rounded p-3 outline-none font-mono text-[14px] text-[#333333]"
                                  id="input-bank-card"
                                />
                                <button 
                                  onClick={() => handleUpdateField('bankCardNumber', '6227000142105432311')}
                                  className="text-[12px] bg-[#EAF3FE] text-[#0D5EFA] font-medium px-4 rounded shrink-0 h-[46px]"
                                >
                                  绑示例
                                </button>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={verifyBank4}
                            className="w-full bg-[#0D5EFA] text-white font-medium py-3 rounded-full text-[14px] mt-6"
                            id="btn-verify-bank"
                          >
                            发送网关极速交叉比对
                          </button>
                        </div>
                      )}

                      {/* Face Live scanning camera simulator */}
                      {state.selectedMethod === VerificationMethod.LIVENESS_FACE && !state.isVerified && (
                        <div className="bg-white px-4 py-4 mb-2 flex-1 text-center space-y-6">
                          <div className="space-y-1">
                            <h3 className="text-[16px] font-bold text-[#333333]">您即将进行人脸识别认证</h3>
                            <p className="text-[12px] text-slate-400">个人信息已安全加密保护</p>
                          </div>

                          {/* Circle Face Scanner */}
                          <div className="relative w-40 h-40 mx-auto rounded-full bg-[#F5F6F8] flex items-center justify-center p-2">
                            <div className="absolute inset-1 rounded-full border border-dotted border-blue-400 animate-spin"></div>
                            <div className="absolute inset-2.5 rounded-full border border-dashed border-blue-500/30 animate-pulse"></div>
                            
                            <div className="relative w-full h-full rounded-full overflow-hidden bg-zinc-950 flex items-center justify-center border-2 border-[#0D5EFA]">
                              {cameraActive && !cameraPermissionError ? (
                                <video 
                                  ref={videoRef} 
                                  autoPlay 
                                  playsInline 
                                  className="w-full h-full object-cover scale-x-[-1]"
                                />
                              ) : (
                                <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-black flex flex-col items-center justify-center">
                                  <div className="absolute top-0 inset-x-0 h-[2px] bg-sky-400 shadow-[0_0_10px_#38bdf8] animate-bounce"></div>
                                  <Camera className="text-blue-400 mb-1" size={28} />
                                  <span className="text-[10px] text-slate-500 font-mono tracking-widest">CAMERA STANDBY</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Multi-feature details columns in Image 3 */}
                          <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 text-center select-none">
                            <div className="flex flex-col items-center">
                              <div className="p-2 rounded-full bg-[#EAF3FE] text-[#0D5EFA] mb-2">
                                <Check size={14} strokeWidth={3} />
                              </div>
                              <span className="text-[10px] text-[#333333]">确保本人操作</span>
                            </div>
                            <div className="flex flex-col items-center">
                              <div className="p-2 rounded-full bg-[#EAF3FE] text-[#0D5EFA] mb-2">
                                <svg className="w-3.5 h-3.5 text-[#0D5EFA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                                </svg>
                              </div>
                              <span className="text-[10px] text-[#333333]">避免强弱光</span>
                            </div>
                            <div className="flex flex-col items-center">
                              <div className="p-2 rounded-full bg-[#EAF3FE] text-[#0D5EFA] mb-2">
                                <Smartphone size={14} strokeWidth={3} />
                              </div>
                              <span className="text-[10px] text-[#333333]">正面对准手机</span>
                            </div>
                          </div>

                          {/* Face Verify Info card details */}
                          <div className="bg-[#F5F6F8] rounded text-left">
                            <div className="bg-[#F5F6F8] px-4 py-3 border-b border-slate-200">
                              <span className="text-[12px] text-[#333333] font-bold">为了准确识别您的身份，请确认以下信息：</span>
                            </div>
                            <div className="divide-y divide-slate-200 text-[12px]">
                              <div className="flex items-center justify-between px-4 py-3">
                                <span className="text-slate-500">姓名</span>
                                <span className="text-[#333333] font-bold">{state.fullName || '张华夏'}</span>
                              </div>
                              <div className="flex items-center justify-between px-4 py-3">
                                <span className="text-slate-500">身份证号</span>
                                <span className="text-[#333333] font-mono font-medium">
                                  {state.idCardNumber ? `${state.idCardNumber.slice(0,6)}********${state.idCardNumber.slice(-4)}` : '310115********1021'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Liveness command hints */}
                          <div className="bg-[#EAF3FE] p-3 rounded">
                            {livenessStage === 'blink' && (
                              <p className="text-[#0D5EFA] font-bold text-[12px] animate-pulse">
                                🔔 提示：请正对并“快速睁眼/眨眼”。 ({livenessTimer}s)
                              </p>
                            )}
                            {livenessStage === 'mouth' && (
                              <p className="text-[#0D5EFA] font-bold text-[12px] animate-pulse">
                                🔔 提示：请缓慢“张嘴并闭嘴”。 ({livenessTimer}s)
                              </p>
                            )}
                            {livenessStage === 'nod' && (
                              <p className="text-orange-600 font-bold text-[12px] animate-pulse">
                                🔔 提示：请上下并“缓慢点头”。 ({livenessTimer}s)
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* SUCCESS STATUS PANEL WHEN VERIFIED */}
                      {state.isVerified && (
                        <div className="bg-white px-4 py-8 mb-2 flex-grow flex flex-col items-center justify-center text-center space-y-6 animate-[fadeIn_0.3s_ease]">
                          <div className="relative">
                            {/* Outer pulsing ring */}
                            <div className="absolute inset-[-12px] rounded-full border-4 border-emerald-50 bg-emerald-50/50 animate-ping"></div>
                            {/* Mid ring */}
                            <div className="relative w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center border-4 border-emerald-100">
                              <Check className="text-emerald-500 w-10 h-10" strokeWidth={3} />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <h3 className="text-[18px] font-bold text-slate-800">核验已通过</h3>
                            <p className="text-[12px] text-slate-400">系统已完成安全信噪与权威中心物理交叉比对</p>
                          </div>

                          <div className="w-full bg-[#F5F6F8] rounded-lg p-4 text-left border border-slate-100">
                            <div className="text-[12px] font-bold text-[#333333] pb-2 border-b border-slate-200 mb-3 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                              实人核验电子凭证
                            </div>
                            
                            <div className="space-y-2.5 text-[12px]">
                              <div className="flex justify-between">
                                <span className="text-slate-500">核验对象:</span>
                                <span className="text-[#333333] font-bold">{state.fullName}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">核验方式:</span>
                                <span className="text-[#333333] font-medium">
                                  {state.selectedMethod === VerificationMethod.LIVENESS_FACE && '公安部生物人脸活体核验'}
                                  {state.selectedMethod === VerificationMethod.OPERATOR_3_FACTOR && '运营商三要素极速校验'}
                                  {state.selectedMethod === VerificationMethod.BANK_4_FACTOR && '银联储蓄卡四要素交叉核对'}
                                  {!state.selectedMethod && '极速人证一致性比对'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">核验通道:</span>
                                <span className="text-emerald-600 font-bold">CTID 官方权威接口</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">核验证书级别:</span>
                                <span className="text-[#0D5EFA] font-bold">
                                  {state.level === CertLevel.ADVANCED ? '高级证书 (Strong Auth)' : '基础证书 (Standard)'}
                                </span>
                              </div>
                              <div className="flex flex-col pt-2 border-t border-dotted border-slate-200">
                                <span className="text-slate-500 mb-1">存证存根哈希 (Evidence Hash):</span>
                                <span className="text-[10px] font-mono bg-white px-2 py-1 rounded text-slate-600 border border-slate-100 select-all break-all leading-tight">
                                  SHA256: 9e5fa472e39c8eb2c1ae11a884fa8e932b10a2bd715b4bc703e
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 w-full flex items-center gap-2.5 text-left text-[11px] text-emerald-700">
                            <Check className="shrink-0 w-4 h-4 text-emerald-600" />
                            <span><b>合规成功：</b>人脸动态生物及物理信道核验存记。请点击下方「下一步」按钮。</span>
                          </div>
                        </div>
                      )}

                    {/* Sticky Footer */}
                    <div className="sticky bottom-0 mt-auto w-full bg-white border-t border-slate-100 px-4 py-3 flex gap-4 z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
                      {state.selectedMethod === VerificationMethod.LIVENESS_FACE && !state.isVerified ? (
                        <div className="flex gap-3 w-full">
                          {state.level !== CertLevel.ADVANCED && (
                            <button
                              onClick={() => setState(prev => ({ ...prev, selectedMethod: null }))}
                              className="flex-1 bg-slate-100 text-[#333333] hover:bg-slate-200 font-semibold py-2.5 rounded-full text-[14px] transition duration-200"
                            >
                              返回
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setState(prev => ({ ...prev, isVerified: true, verifyAttempts: 0 }));
                              onAddAuditLog('人脸活体核验', 'SUCCESS', '实人活体检测与公安人脸特征库比对完全一致！');
                            }}
                            className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-2.5 rounded-full text-[14px] transition duration-200 shadow-lg shadow-blue-100 flex items-center justify-center gap-1"
                          >
                            <Sparkles size={14} className="animate-spin" />
                            跳过人脸识别
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={handleNextStep}
                          disabled={!state.isVerified}
                          className={`w-full font-semibold py-2.5 rounded-full text-[14px] transition duration-200 ${
                            state.isVerified 
                              ? 'bg-[#0D5EFA] hover:bg-[#0b51d6] text-white shadow-lg shadow-blue-100' 
                              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          }`}
                          id="btn-step3-continue"
                        >
                          下一步
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* STEP 4: 企业对公打款实控权校验 */}
                {state.currentStep === 4 && (
                  <motion.div 
                    key="step4" 
                    initial={{ opacity: 0, x: 20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    exit={{ opacity: -20 }}
                    className="flex-1 flex flex-col"
                  >
                    <div className="flex-1 overflow-y-auto">
                      <div className="bg-white px-4 py-4 mb-2 flex flex-col border-b border-slate-100 animate-[fadeIn_0.3s_ease]">
                        <span className="text-[14px] font-bold text-[#333333] block border-b border-slate-100 pb-3 mb-4">
                          企业对公打款实控权校验
                        </span>
                        
                        <p className="text-[12px] text-slate-500 leading-normal mb-4">
                          为防范企业电子证书冒办风险，系统已强制向您登记的如下企业对公银行账户汇入一笔微额验证资金（金额低于1.00元已完成打款，请查阅网银明细）：
                        </p>

                        {/* Bank remittee account details panel */}
                        <div className="bg-[#F5F6F8] p-4 rounded text-[12px] space-y-2 font-mono mb-4">
                          <div className="text-[12px] font-bold text-[#333333] pb-2 border-b border-slate-200">
                            打款到账银行账户信息（核验中）
                          </div>
                          <div className="grid grid-cols-3 gap-y-2 mt-2">
                            <span className="text-slate-500">户名(企业):</span>
                            <span className="col-span-2 text-[#333333] font-sans font-bold">
                              {state.companyName || '华夏建筑工程集团有限公司'}
                            </span>
                            
                            <span className="text-slate-500">对公银行:</span>
                            <span className="col-span-2 text-[#333333] font-sans">
                              {state.identityType === IdentityType.CORP_LEGAL ? '建设银行北京世纪城支行对公专户' : '中国工商银行北京广安门支行'}
                            </span>
                            
                            <span className="text-slate-500">对公账号:</span>
                            <span className="col-span-2 text-[#333333] font-bold select-all">
                              {state.identityType === IdentityType.CORP_LEGAL ? '1105 0165 3700 0000 2841' : '1209 0184 4600 0309 6262'}
                            </span>
                            
                            <span className="text-slate-500">转账附言:</span>
                            <span className="col-span-2 text-[#0D5EFA] font-sans font-bold">实控权认证验证</span>
                          </div>
                        </div>

                        <div className="bg-[#EAF3FE] p-4 rounded space-y-3">
                          <span className="font-bold block text-[12px] text-[#333333]">请输入查收到的对公微额资金：</span>
                          <div className="flex gap-2">
                            <input 
                              type="text"
                              value={state.inputMicroAmount}
                              onChange={(e) => handleUpdateField('inputMicroAmount', e.target.value)}
                              placeholder="请输入如：0.18"
                              className="w-full bg-white border border-blue-200 rounded px-3 py-2 font-mono text-center font-bold text-[18px] text-[#0D5EFA] outline-none"
                              id="input-corp-penny"
                            />
                            <div className="flex items-center text-[12px] text-slate-500 font-bold shrink-0 select-none">
                              元(RMB)
                            </div>
                          </div>
                          <span className="text-[10px] text-slate-500 block leading-tight">
                            提示：您可以在右侧 <b>安全审计面板 的 “对公打款测试沙盒”</b> 复制 or 查看最新模拟打出的入账数目。
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Sticky Footer */}
                    <div className="sticky bottom-0 mt-auto w-full bg-white border-t border-slate-100 px-4 py-3 flex gap-4 z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
                      <button 
                        onClick={handlePrevStep}
                        className="flex-1 py-2.5 text-[#333333] border border-[#DEE3EA] rounded-full text-[14px] bg-white transition duration-200 hover:bg-slate-50"
                      >
                        上一步
                      </button>
                      <button 
                        onClick={verifyCorpTransfer}
                        className="flex-grow bg-[#0D5EFA] text-white font-semibold py-2.5 rounded-full text-[14px] transition duration-200 shadow-md shadow-blue-100"
                        id="btn-verify-corp-penny"
                      >
                        验证金额并下一步
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 5: 材料确认 & 协议签署 (附件上传) */}
                {state.currentStep === 5 && (
                  <motion.div 
                    key="step5" 
                    initial={{ opacity: 0, x: 20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    exit={{ opacity: -20 }}
                    className="flex-1 flex flex-col"
                  >
                    
                    {/* Authorization Letter (for Agent) */}
                    {state.identityType === IdentityType.CORP_AGENT && (
                      <div className="bg-white mb-2 pb-5">
                        <div className="px-4 py-3 text-[14px]">
                          企业授权书 <span className="text-red-500">*</span>
                        </div>
                        
                        <div className="px-4">
                          {/* Utility Buttons */}
                          <div className="flex gap-3 mb-4">
                            <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 border border-[#0D5EFA] text-[#0D5EFA] rounded text-xs bg-white">
                              <Download size={12} />
                              下载模板
                            </button>
                            <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 border border-[#0D5EFA] text-[#0D5EFA] rounded text-xs bg-white">
                              <HelpCircle size={12} />
                              操作说明
                            </button>
                          </div>

                          {/* Upload Area */}
                          <div 
                            onClick={() => simulateFileUpload('LEGAL_AUTH_LETTER')}
                            className="bg-[#F8F9FB] border border-slate-100 rounded py-8 px-4 flex flex-col items-center justify-center cursor-pointer min-h-[160px]"
                          >
                            {hasUploaded('LEGAL_AUTH_LETTER') ? (
                              <div className="text-green-600 font-bold flex flex-col items-center gap-2">
                                <CheckCircle size={32} />
                                <span>授权书已上传</span>
                              </div>
                            ) : (
                              <>
                                <div className="text-[#333333] mb-2 relative">
                                  <Camera size={38} strokeWidth={1} />
                                  <div className="absolute -right-1 -bottom-1 bg-[#0D5EFA] rounded-full text-white w-4 h-4 flex items-center justify-center text-xs shadow">
                                    <Plus size={10} strokeWidth={3} />
                                  </div>
                                </div>
                                <span className="text-[14px] text-slate-400 mb-1">点击上传</span>
                                <span className="text-[10px] text-slate-400 text-center leading-relaxed">
                                  请仔细阅读授权书内容，在对应区域签章、签字，<br/>并保证图片中印章、字迹清晰可见
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Personal Confirmation Panel */}
                    {state.identityType === IdentityType.PERSONAL && (
                      <div className="bg-white px-4 py-8 mb-2 flex-grow flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-[#EAF3FE] flex items-center justify-center mb-2">
                          <Check className="text-[#0D5EFA] w-8 h-8" strokeWidth={3} />
                        </div>
                        <h3 className="text-[16px] font-bold text-slate-800">个人高级数字证书电子签署确认</h3>
                        <p className="text-[12px] text-slate-500 leading-relaxed max-w-[280px]">
                          您正申请个人高级版数字安全证书，下面点击「提交」后，系统将引导进行高级视频双录，以做最终意愿存证。
                        </p>
                        <div className="w-full bg-[#F5F6F8] rounded-lg p-4 text-left border border-slate-100 space-y-2.5 text-[12px]">
                          <div className="flex justify-between">
                            <span className="text-slate-500">签发主体:</span>
                            <span className="text-[#333333] font-bold">{state.fullName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">证件类别:</span>
                            <span className="text-[#333333] font-medium">中华人民共和国居民身份证</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">证书效力:</span>
                            <span className="text-emerald-600 font-bold font-sans">完全具备法律效力</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Business License */}
                    {state.identityType !== IdentityType.PERSONAL && (
                      <div className="bg-white mb-2 pb-5">
                        <div className="px-4 py-3 text-[14px]">
                          统一社会信用代码证或营业执照 <span className="text-red-500">*</span>
                        </div>
                        <div className="px-4">
                          <div 
                            onClick={() => simulateFileUpload('BUSINESS_LICENSE')}
                            className="bg-[#F8F9FB] border border-slate-100 rounded py-8 px-4 flex flex-col items-center justify-center cursor-pointer min-h-[160px] relative"
                          >
                            {hasUploaded('BUSINESS_LICENSE') ? (
                              <div className="w-full text-center">
                                {/* Mock Image Representation */}
                                <div className="w-full h-32 bg-[#E1E4D6] rounded-sm flex items-center justify-center border-4 border-[#FDFDFD] shadow-sm relative mx-auto max-w-[240px]">
                                  <div className="absolute top-2 mt-1 w-8 h-8 rounded-full bg-red-600 flex items-center justify-center"><span className="text-[6px] text-yellow-300">★</span></div>
                                  <span className="text-slate-600 font-serif font-bold tracking-widest mt-6">营业执照</span>
                                  <button className="absolute -right-2 -top-2 bg-black/40 text-white rounded-sm p-1 z-10 w-6 h-6 flex items-center justify-center text-xs">
                                    ✕
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="text-[#333333] mb-2 relative">
                                  <Camera size={38} strokeWidth={1} />
                                  <div className="absolute -right-1 -bottom-1 bg-[#0D5EFA] rounded-full text-white w-4 h-4 flex items-center justify-center text-xs shadow">
                                    <Plus size={10} strokeWidth={3} />
                                  </div>
                                </div>
                                <span className="text-[14px] text-slate-400">点击上传</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Service Agreement (for Agent) */}
                    {state.identityType === IdentityType.CORP_AGENT && (
                      <div className="bg-white mb-2 pb-5">
                        <div className="px-4 py-3 text-[14px]">
                          加盖公章的服务协议 <span className="text-red-500">*</span>
                        </div>
                        
                        <div className="px-4">
                          {/* Utility Buttons */}
                          <div className="flex gap-3 mb-4">
                            <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 border border-[#0D5EFA] text-[#0D5EFA] rounded text-xs bg-white">
                              <Download size={12} />
                              下载模板
                            </button>
                            <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 border border-[#0D5EFA] text-[#0D5EFA] rounded text-xs bg-white">
                              <HelpCircle size={12} />
                              操作说明
                            </button>
                          </div>

                          <div 
                            onClick={() => simulateFileUpload('SEALED_AGREEMENT')}
                            className="bg-[#F8F9FB] border border-slate-100 rounded py-8 px-4 flex flex-col items-center justify-center cursor-pointer min-h-[160px]"
                          >
                            {hasUploaded('SEALED_AGREEMENT') ? (
                              <div className="text-green-600 font-bold flex flex-col items-center gap-2">
                                <CheckCircle size={32} />
                                <span>协议文件已上传</span>
                              </div>
                            ) : (
                              <>
                                <div className="text-[#333333] mb-2 relative">
                                  <Camera size={38} strokeWidth={1} />
                                  <div className="absolute -right-1 -bottom-1 bg-[#0D5EFA] rounded-full text-white w-4 h-4 flex items-center justify-center text-xs shadow">
                                    <Plus size={10} strokeWidth={3} />
                                  </div>
                                </div>
                                <span className="text-[14px] text-slate-400 mb-1">点击上传</span>
                                <span className="text-[10px] text-slate-400 text-center leading-relaxed">
                                  请下载服务协议并加盖企业公章，拍照或扫描后在此上传
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Sticky Footer */}
                    <div className="sticky bottom-0 mt-auto w-full bg-white border-t border-slate-100 px-4 py-3 flex gap-4 z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
                      <button 
                         onClick={handlePrevStep}
                         className="flex-1 py-2.5 text-[#333333] border border-[#DEE3EA] rounded-full text-[14px] bg-white transition duration-200 hover:bg-slate-50"
                      >
                        上一步
                      </button>
                      <button
                        onClick={handleNextStep}
                        disabled={
                          state.identityType === IdentityType.CORP_AGENT 
                            ? (!hasUploaded('BUSINESS_LICENSE') || !hasUploaded('LEGAL_AUTH_LETTER') || !hasUploaded('SEALED_AGREEMENT'))
                            : state.identityType === IdentityType.PERSONAL
                              ? false
                              : (!hasUploaded('BUSINESS_LICENSE'))
                        }
                        className={`flex-1 py-2.5 rounded-full text-[14px] transition duration-200 ${
                          (state.identityType === IdentityType.CORP_AGENT && hasUploaded('BUSINESS_LICENSE') && hasUploaded('LEGAL_AUTH_LETTER') && hasUploaded('SEALED_AGREEMENT')) || 
                          (state.identityType === IdentityType.CORP_LEGAL && hasUploaded('BUSINESS_LICENSE')) ||
                          (state.identityType === IdentityType.PERSONAL)
                            ? 'bg-[#0D5EFA] hover:bg-[#0b51d6] text-white shadow-lg shadow-blue-100' 
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                        id="btn-step5-continue"
                      >
                        提交
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 6: 意愿双录补充存证 */}
                {state.currentStep === 6 && (
                  <motion.div 
                    key="step6" 
                    initial={{ opacity: 0, x: 20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    exit={{ opacity: -20 }}
                    className="flex-1 flex flex-col"
                  >
                    <div className="flex-1 overflow-y-auto">
                      {/* Video dual recording (Always for all ADVANCED levels: Personal, Corp Agent, Corp Legal) */}
                      {state.level === CertLevel.ADVANCED && (
                        <div className="bg-white px-4 py-4 mb-2 flex-grow flex flex-col animate-[fadeIn_0.3s_ease]">
                          <span className="text-[14px] font-bold text-[#333333] border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
                            <Video size={16} className="text-[#0D5EFA]" />
                            高级证书意愿双录补充存证
                          </span>
                          <p className="text-[12px] text-slate-500 leading-normal mb-4 flex-1">
                            高级版数字证书在招投标及合同签署具有强法律效力。根据合规指引，请大声清脆照读以下声明，系统将进行意愿音视频核对留痕。
                          </p>

                          <div className="relative w-full h-[200px] mb-6 rounded-lg bg-slate-900 border-2 border-slate-200 overflow-hidden shadow-inner flex flex-col items-center justify-center">
                            {/* Simulated Camera Area */}
                            <video 
                              autoPlay 
                              playsInline 
                              muted 
                              className="absolute inset-0 w-full h-full object-cover scale-x-[-1] opacity-60"
                            />
                            
                            {/* Overlay UI */}
                            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded text-white z-10">
                              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                              <span className="text-[10px] font-mono tracking-wider">REC</span>
                            </div>
                            
                            <div className="z-10 flex flex-col items-center">
                              <Camera className="text-white/30 mb-2 w-10 h-10" />
                              <span className="text-[12px] text-white/50 tracking-widest font-mono">
                                FOCUS CAMERA
                              </span>
                            </div>
                            
                            {/* Scanning line animation */}
                            <div className="absolute inset-x-0 h-1 bg-blue-500/50 shadow-[0_0_10px_#3b82f6] animate-[scan_3s_ease-in-out_infinite]"></div>
                          </div>

                          <div className="bg-[#EAF3FE] p-5 rounded text-[14px] leading-relaxed text-[#0D5EFA] font-bold text-center mb-4">
                            “我自愿在此办理高级个人/企业电子钥匙数字证书，已知晓此证书可用于项目招投标、大额借贷签署等高证明力场景，并承担全部对应法律责任。”
                          </div>

                          <div className="bg-[#F5F6F8] p-4 rounded flex items-center gap-2 text-[12px] text-slate-500 font-medium">
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                            <span>现场麦克风与面部抓拍进行中：已核验归档 100%</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Sticky Footer */}
                    <div className="sticky bottom-0 mt-auto w-full bg-white border-t border-slate-100 px-4 py-3 flex gap-4 z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
                      <button 
                        onClick={handlePrevStep}
                        className="flex-1 py-2.5 text-[#333333] border border-[#DEE3EA] rounded-full text-[14px] bg-white transition duration-200 hover:bg-slate-50"
                      >
                        上一步
                      </button>
                      <button
                        onClick={handleNextStep}
                        className="flex-grow bg-[#0D5EFA] text-white font-semibold py-2.5 rounded-full text-[14px] transition duration-200 shadow-md shadow-blue-100 animate-[pulse_2s_infinite]"
                        id="btn-confirm-video-double"
                      >
                        录制完毕并下一步
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 7: 正常办结/SUCCESS AND OVERVIEW */}
                {state.currentStep === 7 && (
                  <motion.div 
                    key="step7" 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    className="flex-1 flex flex-col"
                  >
                    <div className="bg-white flex-1 flex flex-col items-center justify-center p-6 space-y-6">
                      <div className="space-y-4 text-center">
                        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-500 shadow-sm animate-bounce mb-2">
                          <CheckCircle2 size={40} />
                        </div>
                        
                        <div className="space-y-1">
                          <h2 className="text-[18px] font-bold text-[#333333]">认证信息已提交</h2>
                          <span className="text-[10px] text-[#0D5EFA] font-mono font-bold tracking-widest block">CERTIFICATE AUTHORITY ISSUED</span>
                        </div>
                      </div>

                      {/* Generated Digital Certificate Visual representation - Premium Ice-Blue Gradient style */}
                      <div className="w-full bg-gradient-to-br from-[#EAF3FE] to-[#F5F6F8] text-slate-800 p-4 rounded bg-white relative overflow-hidden text-left">
                        <div className="absolute right-[-10px] bottom-[-10px] opacity-[0.03] text-blue-500 pointer-events-none transform rotate-12">
                          <Shield size={120} />
                        </div>

                        <div className="flex justify-between items-start border-b border-blue-100 pb-3 mb-3">
                          <div>
                            <span className="text-[10px] bg-[#0D5EFA] px-2 py-0.5 rounded text-white font-bold">
                              {state.level === CertLevel.ADVANCED ? '高级尊享版' : '基础轻量版'}
                            </span>
                            <span className="text-[12px] text-[#333333] block mt-2 font-bold">数字证书电子存根</span>
                          </div>
                          <span className="text-[10px] text-[#0D5EFA] font-mono font-bold">RSA-2048 / SM2</span>
                        </div>

                        <div className="space-y-2 text-[12px] font-mono text-slate-500 font-medium">
                          <div className="flex justify-between">
                            <span>申请主体:</span>
                            <span className="text-[#333333] font-sans font-bold">{state.fullName}</span>
                          </div>
                          {state.identityType !== IdentityType.PERSONAL && (
                            <div className="flex justify-between">
                              <span>企业名称:</span>
                              <span className="text-[#333333] truncate max-w-[130px] font-sans font-bold">{state.companyName}</span>
                            </div>
                          )}
                          <div className="flex justify-between mt-2">
                            <span>有效期限:</span>
                            <span className="text-[#333333]">12个月 (自今日起生效)</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Sticky Footer */}
                    <div className="sticky bottom-0 mt-auto w-full bg-white border-t border-slate-100 px-4 py-3 flex gap-4 z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
                      <button
                        onClick={() => {
                          setState(prev => ({ 
                            ...prev, 
                            currentStep: 1, 
                            sliderPassed: false,
                            isVerified: false,
                            selectedMethod: null,
                            verifyAttempts: 0,
                            signatureDone: false,
                            pinCode: '',
                            flowStatus: 'PROCESSING',
                            userIdCardLast4: ''
                          }));
                          onAddAuditLog('全新申请启动', 'SUCCESS', '订户在完结页面选择“重提发起”开始测试其他CA规格。');
                        }}
                        className="w-full bg-[#0D5EFA] hover:bg-[#0b51d6] text-white font-semibold py-2.5 rounded-full text-[14px] transition duration-200 shadow-lg shadow-blue-100"
                        id="btn-restart-simulator"
                      >
                        测试其他办理场景
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    );
}
