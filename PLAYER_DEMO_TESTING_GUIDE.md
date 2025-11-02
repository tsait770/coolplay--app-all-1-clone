# Player Demo 测试指南

## 🎯 测试目标

验证 `/player-demo` 页面的所有核心功能是否正常运作。

---

## 📍 访问测试页面

### 方法 1: Web 浏览器
```
http://localhost:8081/player-demo
```

### 方法 2: 手机端 (扫描 QR 码)
在 Expo 开发工具中扫描 QR 码，然后在应用内导航到 `/player-demo`

### 方法 3: 直接路由
在应用的任何位置执行:
```typescript
import { router } from 'expo-router';
router.push('/player-demo');
```

---

## ✅ 测试清单

### 1️⃣ URL 输入和播放测试

#### 测试步骤:
1. **打开 Player Demo 页面**
2. **输入测试 URL**
3. **点击 "Play Video" 按钮**
4. **验证视频是否正常加载和播放**

#### 测试用例:

| URL 类型 | 测试 URL | 预期结果 |
|---------|---------|---------|
| **YouTube** | `https://www.youtube.com/watch?v=dQw4w9WgXcQ` | ✅ 使用 WebView 嵌入播放 |
| **Vimeo** | `https://vimeo.com/76979871` | ✅ 使用 WebView 嵌入播放 |
| **直接 MP4** | `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4` | ✅ 使用原生播放器 |
| **HLS 流** | `https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8` | ✅ 使用原生播放器 |
| **DRM 平台** | `https://www.netflix.com/title/80192098` | ❌ 显示不支持的错误消息 |
| **成人平台** | `https://www.pornhub.com/view_video.php?viewkey=xxx` | ⚠️ 触发年龄验证模态框 |

#### 验证点:
- [ ] URL 输入框可以正常输入
- [ ] "Play Video" 按钮点击有响应
- [ ] 视频加载时显示加载指示器
- [ ] 视频成功加载后显示播放界面
- [ ] 错误情况显示友好的错误消息

---

### 2️⃣ 视频播放控制测试

#### 测试步骤:
1. **播放一个视频** (建议使用 MP4 直链)
2. **测试以下控制功能**:

#### 控制功能清单:

| 功能 | 测试方法 | 预期结果 |
|-----|---------|---------|
| **播放/暂停** | 点击播放/暂停按钮 | ✅ 视频正常播放/暂停 |
| **快进 10 秒** | 点击快进按钮 | ✅ 视频跳转到 +10 秒位置 |
| **快退 10 秒** | 点击快退按钮 | ✅ 视频跳转到 -10 秒位置 |
| **静音切换** | 点击音量按钮 | ✅ 声音静音/取消静音 |
| **全屏切换** | 点击全屏按钮 | ✅ 进入/退出全屏模式 |
| **控制栏自动隐藏** | 等待 3 秒 | ✅ 控制栏自动消失 |
| **控制栏重新显示** | 点击视频区域 | ✅ 控制栏重新出现 |

#### 验证点:
- [ ] 所有控制按钮可见且可点击
- [ ] 按钮点击后有即时反馈
- [ ] 控制栏在 3 秒后自动隐藏
- [ ] 点击视频区域可重新显示控制栏
- [ ] 图标根据状态正确切换 (播放⇄暂停, 静音⇄有声)

---

### 3️⃣ 会员信息显示测试

#### 测试步骤:
1. **点击 URL 输入框右侧的信息按钮 (ℹ️)**
2. **验证显示的会员信息**

#### 验证点:
- [ ] 显示当前会员等级 (FREE_TRIAL, FREE, BASIC, PREMIUM)
- [ ] 显示支持的平台列表 (前 10 个 + 总数)
- [ ] 显示支持的格式列表 (MP4, HLS, DASH, etc.)
- [ ] 显示语音控制支持的语言列表 (en, zh-TW, zh-CN, etc.)
- [ ] 信息格式正确，易于阅读

#### 不同会员等级的预期结果:

| 会员等级 | 支持平台数 | 成人内容 | 配额 |
|---------|-----------|---------|------|
| **FREE_TRIAL** | 15+ (含成人) | ✅ | 2000 次总计 |
| **FREE** | 15 (不含成人) | ❌ | 30 次/天 |
| **BASIC** | 15+ (含成人) | ✅ | 1500 次/月 + 40 次/天 |
| **PREMIUM** | 15+ (含成人) | ✅ | ♾️ 无限 |

---

### 4️⃣ 语音指令测试

#### A. 原生语音识别测试

**测试步骤**:
1. **点击 "Tap to Speak" 按钮** (带麦克风图标的大按钮)
2. **授权麦克风权限** (首次使用)
3. **说出语音指令**
4. **观察识别结果**

**测试用例**:
| 语言 | 指令 | 预期解析结果 |
|-----|------|------------|
| English | "play" | `{ type: 'play', confidence: > 0.7 }` |
| English | "pause" | `{ type: 'pause', confidence: > 0.7 }` |
| English | "fast forward 10 seconds" | `{ type: 'seek_forward', value: 10, unit: 'seconds' }` |
| English | "volume up" | `{ type: 'volume_up', confidence: > 0.7 }` |
| 中文 | "播放" | `{ type: 'play', confidence: > 0.7 }` |
| 中文 | "暂停" | `{ type: 'pause', confidence: > 0.7 }` |
| 中文 | "快进十秒" | `{ type: 'seek_forward', value: 10, unit: 'seconds' }` |

**验证点**:
- [ ] 麦克风权限请求正常弹出
- [ ] 按钮在监听时显示 "Listening..." 状态
- [ ] 实时显示语音转文字结果 (transcript)
- [ ] 语音识别结束后显示解析结果弹窗
- [ ] 弹窗包含: 指令类型、原始文本、信心度
- [ ] 信心度 > 70% 视为成功识别

**平台差异**:
- **Web**: 使用 Web Speech API (Chrome/Edge) 或 MediaRecorder (Firefox)
- **iOS**: 使用 Apple Speech Framework (通过 MediaRecorder + STT API)
- **Android**: 使用 Google Speech API (通过 MediaRecorder + STT API)

#### B. 预定义指令测试

**测试步骤**:
1. **点击预定义指令按钮** (不需要麦克风)
2. **观察解析结果弹窗**

**测试用例**:
| 按钮文字 | 预期解析结果 |
|---------|------------|
| Test: "Play" | `{ type: 'play' }` |
| Test: "Fast forward 10 seconds" | `{ type: 'seek_forward', value: 10, unit: 'seconds' }` |
| Test: "播放" (Chinese) | `{ type: 'play' }` |

**验证点**:
- [ ] 所有预定义按钮可点击
- [ ] 点击后立即显示解析结果弹窗
- [ ] 解析结果与预期一致
- [ ] 弹窗可以正常关闭

---

### 5️⃣ 年龄验证功能测试

#### 测试步骤:
1. **输入成人平台 URL**
   ```
   https://www.pornhub.com/view_video.php?viewkey=xxx
   ```
2. **点击 "Play Video"**
3. **验证年龄验证模态框是否弹出**

#### 年龄验证模态框验证点:
- [ ] 模态框正确显示
- [ ] 包含法律免责声明文字
- [ ] 有日期选择器 (选择出生日期)
- [ ] 有确认复选框 ("我确认我已年满 18 岁")
- [ ] 日期和复选框都选中后，"确认" 按钮可用
- [ ] 点击 "确认" 后模态框关闭
- [ ] 验证成功后可以继续播放视频
- [ ] 验证记录保存到数据库 (age_verified = true)

#### 边界测试:
- [ ] 选择未满 18 岁的出生日期 → 显示错误提示
- [ ] 未勾选确认复选框 → "确认" 按钮保持禁用
- [ ] 点击 "取消" → 模态框关闭，不播放视频

---

### 6️⃣ 错误处理测试

#### 测试用例:

| 错误场景 | 测试方法 | 预期结果 |
|---------|---------|---------|
| **空 URL** | 不输入 URL 直接点击 "Play Video" | ❌ Alert: "Please enter a valid URL" |
| **无效 URL** | 输入 `not-a-url` | ❌ 显示错误消息 |
| **DRM 平台** | 输入 Netflix URL | ❌ Alert: "不支持 DRM 平台" |
| **视频加载失败** | 输入不存在的 MP4 链接 | ❌ 显示加载错误 |
| **麦克风权限拒绝** | 拒绝麦克风权限 | ❌ Alert: "Microphone permission denied" |
| **语音识别失败** | 保持沉默 5 秒 | ❌ Alert: "No speech detected" |

#### 验证点:
- [ ] 所有错误都有友好的用户提示
- [ ] 错误消息清晰易懂
- [ ] 错误不会导致应用崩溃
- [ ] 可以从错误状态恢复

---

### 7️⃣ 示例 URL 快速测试

#### 测试步骤:
1. **滚动到 "Sample URLs" 部分**
2. **依次点击每个示例 URL**
3. **验证视频是否自动加载和播放**

#### 示例 URL 清单:
- [ ] YouTube 示例 → 正常播放
- [ ] Vimeo 示例 → 正常播放
- [ ] MP4 直链示例 → 正常播放

#### 验证点:
- [ ] 点击示例 URL 后自动填充到输入框
- [ ] 视频自动开始加载
- [ ] 无需再次点击 "Play Video"

---

### 8️⃣ UI/UX 测试

#### 布局测试:
- [ ] 页面在不同屏幕尺寸下正常显示
- [ ] 横屏模式下布局合理
- [ ] 键盘弹出时不遮挡重要内容
- [ ] 滚动流畅，无卡顿

#### 视觉测试:
- [ ] 按钮颜色和样式符合设计规范
- [ ] 文字清晰可读
- [ ] 图标大小合适
- [ ] 加载指示器正常显示
- [ ] 深色主题下所有元素可见

#### 交互测试:
- [ ] 按钮点击有视觉反馈 (按下效果)
- [ ] 触摸区域足够大 (至少 44x44 点)
- [ ] 长按、双击等手势无异常
- [ ] 没有意外的页面跳转

---

## 🐛 常见问题排查

### 问题 1: 页面无法访问

**症状**: 404 Not Found

**解决方案**:
```bash
# 检查文件是否存在
ls -la app/player-demo.tsx

# 重启开发服务器
bun run start
```

### 问题 2: 视频播放器不显示

**症状**: 只显示占位符，视频不加载

**排查步骤**:
1. 检查浏览器控制台是否有错误
2. 验证 URL 是否有效
3. 检查会员权限 (`tier` 变量)
4. 查看 `detectVideoSource()` 返回结果

**解决方案**:
```typescript
// 在 UniversalVideoPlayer.tsx 中添加日志
console.log('[DEBUG] sourceInfo:', sourceInfo);
console.log('[DEBUG] playbackEligibility:', playbackEligibility);
```

### 问题 3: 语音识别无响应

**症状**: 点击 "Tap to Speak" 没有反应

**排查步骤**:
1. **检查麦克风权限** → 浏览器设置中允许麦克风访问
2. **检查平台兼容性** → Chrome/Edge 支持 Web Speech API, Firefox 需要 MediaRecorder
3. **查看控制台日志** → 查找 `[NativeSpeechRecognition]` 开头的日志

**解决方案**:
```typescript
// 强制使用 MediaRecorder 模式 (如果 Web Speech API 不可用)
// 在 useNativeSpeechRecognition.ts 中
const startWebSpeechAPI = () => {
  console.log('Web Speech API availability:', 
    typeof (window as any).webkitSpeechRecognition);
};
```

### 问题 4: 年龄验证不触发

**症状**: 输入成人 URL 后没有弹出验证框

**排查步骤**:
1. 检查 `sourceInfo.requiresAgeVerification` 是否为 `true`
2. 检查 `onAgeVerificationRequired` 回调是否正确传递
3. 查看 `AgeVerificationModal` 的 `visible` 状态

**解决方案**:
```typescript
// 在 player-demo.tsx 中添加日志
useEffect(() => {
  console.log('[DEBUG] showAgeVerification:', showAgeVerification);
}, [showAgeVerification]);
```

### 问题 5: WebView 显示空白

**症状**: WebView 加载但内容空白

**可能原因**:
- YouTube/Vimeo embed URL 格式错误
- 网站阻止了 iframe 嵌入
- WebView JavaScript 未启用

**解决方案**:
```typescript
// 检查 UniversalVideoPlayer.tsx 中的 WebView 配置
<WebView
  source={{ uri: embedUrl }}
  javaScriptEnabled={true}
  domStorageEnabled={true}
  allowsFullscreenVideo={true}
  // 添加调试回调
  onError={(syntheticEvent) => {
    console.error('WebView error:', syntheticEvent.nativeEvent);
  }}
  onHttpError={(syntheticEvent) => {
    console.error('WebView HTTP error:', syntheticEvent.nativeEvent);
  }}
/>
```

---

## 📊 性能测试

### 加载时间测试:
- [ ] YouTube embed 加载时间 < 3 秒
- [ ] Vimeo embed 加载时间 < 3 秒
- [ ] MP4 直链首次加载时间 < 2 秒

### 内存使用测试:
- [ ] 播放视频时内存增长 < 100MB
- [ ] 切换视频后旧视频资源正确释放
- [ ] 长时间使用无明显内存泄漏

### 网络测试:
- [ ] 在 4G 网络下可正常播放
- [ ] 网络中断时显示友好提示
- [ ] 网络恢复后可自动继续播放

---

## ✅ 测试完成标准

所有以下条件都满足时，视为测试通过:

1. **✅ 核心功能**
   - URL 输入和播放正常
   - 视频控制功能完整
   - 会员信息正确显示

2. **✅ 语音功能**
   - 原生语音识别可用
   - 预定义指令测试通过
   - 多语言支持正常

3. **✅ 安全功能**
   - 年龄验证正确触发
   - DRM 平台正确拒绝
   - 权限请求合规

4. **✅ 错误处理**
   - 所有错误场景有提示
   - 应用不会崩溃
   - 可从错误恢复

5. **✅ 用户体验**
   - UI 清晰易用
   - 交互流畅
   - 性能良好

---

## 📝 测试报告模板

测试完成后，请填写以下报告:

```markdown
# Player Demo 测试报告

**测试日期**: 2025-11-XX  
**测试人员**: [姓名]  
**测试平台**: Web / iOS / Android  
**浏览器/设备**: [浏览器版本] / [设备型号]

## 测试结果概览

- ✅ URL 输入和播放: PASS / FAIL
- ✅ 视频控制: PASS / FAIL
- ✅ 会员信息显示: PASS / FAIL
- ✅ 语音识别 (原生): PASS / FAIL
- ✅ 语音识别 (预定义): PASS / FAIL
- ✅ 年龄验证: PASS / FAIL
- ✅ 错误处理: PASS / FAIL
- ✅ UI/UX: PASS / FAIL

## 发现的问题

1. [问题描述]
   - 严重程度: 高 / 中 / 低
   - 复现步骤: ...
   - 截图: [如有]

2. [问题描述]
   - ...

## 建议改进

1. [改进建议]
2. [改进建议]

## 总体评价

[总体测试体验和评价]
```

---

**测试状态**: ⏳ 待测试  
**预计测试时间**: 30-45 分钟  
**测试难度**: ⭐⭐⭐ 中等
