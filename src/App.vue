<template>
    <div class="logo">
        <component :is="IconPanelNormal()" class="logo-icon" />
        <span class="logo-text"> TinyConnect </span>
    </div>
    <div class="container">
        <div class="title">
            <component :is="IconRichTextQuoteText()" class="title-icon" />
            <span class="title-text">
                {{ getCurrentPeriod() }}好，欢迎使用
            </span>
            <component
                :is="IconRichTextQuoteText()"
                class="title-icon-reverse"
            />
        </div>
        <div class="subtitle">
            <div class="sub-content">
                <span>
                    <component :is="IconTotalNolume()" />
                    当前时间&nbsp;
                </span>
                <span class="digital-time">{{ currentTime }}</span>
            </div>
            <div class="sub-content">
                <span>
                    <component :is="IconProcessing()" />
                    计划关机时间&nbsp;
                </span>
                <span class="digital-time">{{ pickTime }}</span>
            </div>
        </div>
        <div class="set-ipaddress">
            <tiny-ip-address
                class="ip-input"
                v-model="ipAddress"
                placeholder="请输入IPv4地址"
            ></tiny-ip-address>
            <tiny-numeric
                class="port-input"
                v-model="port"
                placeholder="端口"
                :controls="false"
                :empty-value="null"
                allow-empty
            ></tiny-numeric>
        </div>
        <div class="set-time">
            <tiny-drop-times
                v-model="pickTime"
                placeholder="计划关机时间"
                :start="pickTimeStart"
                :end="pickTimeEnd"
                :step="5"
                @change="(value) => { console.log(value) }"
            ></tiny-drop-times>
            <div class="set-time-value">
                <tiny-numeric
                    v-model="delayTime"
                    class="time-input"
                    placeholder="延迟关机时长"
                    :change-compat="false"
                    :controls="true"
                    :empty-value="0"
                    :min="0"
                    :step="5"
                    @change="onDelayTimeChange"
                    allow-empty
                ></tiny-numeric>
                <tiny-base-select 
                    v-model="timeType"
                    class="time-type-select"
                    :options="timeTypeOptions"
                >
                    <template #prefix>
                        <component :is="IconClockWork()" />
                    </template>
                </tiny-base-select>
            </div>
            <tiny-button
                type="primary"
                class="tiny-button"
                @click="() => { console.log('click') }"
                :icon="IconFinishO()"
                >SET SHUTDOWN TIME{{ delayTime }}
            </tiny-button>
        </div>
        <tiny-button
            type="primary"
            class="tiny-button"
            @click="showDrawerModal"
            :icon="IconRichTextLinkUnlink()"
            >CONNECT SERVICE
        </tiny-button>
        <tiny-drawer
            :visible.sync="isDeawerVisible"
            title="验证通行证"
            placement="bottom"
            height="55%"
            :before-close="onDrawerClose"
        >
            <div class="verification-container">
                <input
                    type="text"
                    maxlength="1"
                    v-for="(code, index) in verificationCodes"
                    :key="index"
                    v-model="verificationCodes[index]"
                    @input="handleInput(index, $event)"
                    @keydown="handleKeyDown(index, $event)"
                    class="verification-input"
                />
            </div>
            <div class="drawer-footer">
                <tiny-button @click="onDrawerClose">取消</tiny-button>
                <tiny-button type="primary" @click="validatePassword"
                    >确定</tiny-button
                >
            </div>
        </tiny-drawer>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from "vue";
import {
    TinyButton,
    TinyIpAddress,
    TinyNumeric,
    TinyDrawer,
    TinyModal,
    TinyDropTimes,
    TinyBaseSelect
} from "@opentiny/vue";
import {
    IconRichTextLinkUnlink,
    IconTotalNolume,
    IconRichTextQuoteText,
    IconPanelNormal,
    IconProcessing,
    IconClockWork,
    IconFinishO,
    IconTurnOn
} from "@opentiny/vue-icon";

const ipAddress = ref("192.168.0.105");
const port = ref("5000");
const isDeawerVisible = ref(false);
const today = ref(new Date());
const currentTime = ref(today.value.toLocaleTimeString());
const pickTimeStart = ref(
    Math.floor(
        (today.value - new Date(today.value.toDateString())) / 1000 / 600
    ) * 10 + 10
);
const pickTimeEnd = ref(pickTimeStart.value + 360);

const timeType = ref("minute");
const timeTypeOptions = ref([
    { label: "时", value: "hour" },
    { label: "分", value: "minute" },
    { label: "秒", value: "second" }
]);

const pickTime = ref();
const delayTime = ref();

const verificationCodes = ref(["", "", "", "", "", ""]);
const verifyCode = ref("");

const correctVerifyCode = ref("TEST01");

const onDelayTimeChange = (value) => {
    // 如果计划关机时间为空 则用当前时间
    console.log(pickTime.value);
    const newTime = pickTime.value ? new Date(pickTime.value) : new Date();
    console.log(newTime);
    return;
    switch (timeType.value) {
        case "hour":
            newTime.setHours(current.getHours() + value);
            break;
        case "minute":
            newTime.setMinutes(current.getMinutes() + value);
            break;
        case "second":
            newTime.setSeconds(current.getSeconds() + value);
            break;
    }
    pickTime.value = newTime.toLocaleTimeString();
    console.log(newTime);
};

const handleInput = (index, event) => {
    const value = event.target.value;
    // 只允许输入字母和数字
    if (!/^[a-zA-Z0-9]$/.test(value)) {
        event.target.value = "";
        return;
    }
    verificationCodes.value[index] = value;

    // 当输入框输入完毕时，触发验证
    if (verificationCodes.value.join("").length === 6) {
        verifyCode.value = verificationCodes.value.join("");
        console.log(verifyCode.value);
    }

    // 自动聚焦下一个输入框
    if (value && index < verificationCodes.value.length - 1) {
        const nextInput = event.target.nextElementSibling;
        if (nextInput) {
            nextTick(() => {
                nextInput.focus();
            });
        }
    }
};
const handleKeyDown = (index, event) => {
    // 删除操作
    if (event.key === "Backspace" && !event.target.value && index > 0) {
        const prevInput = event.target.previousElementSibling;
        if (prevInput) {
            nextTick(() => {
                prevInput.focus();
            });
        }
    }
};

// 获取当前时间段
const getCurrentPeriod = () => {
    const cHour = new Date().getHours();
    switch (true) {
        case cHour >= 0 && cHour < 6:
            return "凌晨";
        case cHour >= 6 && cHour < 12:
            return "早上";
        case cHour >= 12 && cHour < 18:
            return "下午";
        case cHour >= 18 && cHour < 24:
            return "晚上";
    }
    return "";
};

var timer;

onMounted(() => {
    // 设置定时器 动态更新时间
    timer = setInterval(() => {
        currentTime.value = new Date().toLocaleTimeString();
    }, 1000);
});

onBeforeUnmount(() => {
    // 组件卸载前清除定时器
    clearInterval(timer);
});

const showDrawerModal = () => {
    if (!ipAddress.value || !port.value) {
        TinyModal.message({
            message: "IP地址和端口不能为空",
            status: "warning"
        });
        return;
    }
    isDeawerVisible.value = true;
};

const showMessageBox = (message, status) => {
    TinyModal.message({
        message: message,
        status: status
    });
};

const onDrawerClose = () => {
    isDeawerVisible.value = false;
    showMessageBox("取消连接", "warning");
    // 清空验证码
    if (verificationCodes.value) {
        verificationCodes.value = ["", "", "", "", "", ""];
        verifyCode.value = "";
    }
};

const validatePassword = () => {
    if (verifyCode.value === correctVerifyCode.value) {
        // 假设正确密码为 'correctPassword'
        showMessageBox("连接成功", "success");
        isDeawerVisible.value = false;
    } else {
        showMessageBox("密码错误，请重试！", "error");
    }

    // 清空验证码
    verificationCodes.value = ["", "", "", "", "", ""];
    verifyCode.value = "";
};
</script>

<style scoped>
/* shetumodengxiaofangti */
@import url("https://static.zeoseven.com/zsft/449/main/result.css");

/* zsft-cb */
@font-face {
    font-family: "zsft-cb";
    src: url("https://static.zeoseven.com/zsft/cb/main.woff2") format("woff2"),
        url("https://static-host.zeoseven.com/zsft/cb/main.woff2")
            format("woff2");
    font-display: swap;
}

/* zsft-bl */
@font-face {
    font-family: "zsft-bl";
    src: url("https://static.zeoseven.com/zsft/bl/main.woff2") format("woff2"),
        url("https://static-host.zeoseven.com/zsft/bl/main.woff2")
            format("woff2");
    font-display: swap;
}

.logo {
    justify-content: center;
    align-items: center;
    margin-bottom: 30%;
}

.logo-text {
    font-size: 16px;
    font-weight: bold;
    font-family: "zsft-bl";
}

.container {
    margin-top: 10%;
    margin-bottom: 50%;
}

.title {
    font-size: 24px;
    text-align: start;
    font-weight: bold;
    margin-bottom: 12px;
    font-family: "shetumodengxiaofangti";
    display: flex;
}

.title-icon {
    height: 22px;
}

.title-icon-reverse {
    height: 22px;
    transform: rotate(180deg);
}

.subtitle {
    font-size: 16px;
    text-align: start;
    font-weight: bold;
    margin-bottom: 20%;
    font-family: "shetumodengxiaofangti";
    display: flex;
    flex-direction: column;
}

.sub-content {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
}

.digital-time {
    font-size: 12px;
    font-family: "zsft-cb";
    font-weight: normal;
    align-self: center;
}

.set-ipaddress {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
}

.set-time-value {
    display: flex;
    flex-direction: row;
    margin-top: 15px;
}

.verification-container {
    display: flex;
    justify-content: center;
    margin-top: 5px;
}

.verification-input {
    width: 40px;
    height: 40px;
    margin-right: 2%;
    line-height: 40px;
    text-align: center;
    vertical-align: middle;
    font-family: "zsft-bl";
    font-size: 24px;
    border: 1px solid #c2c2c2;
    background-color: #fafafa;
    border-radius: 5px;
    &:last-child {
        margin-right: 0;
    }
}

.verification-input:focus {
    outline: none;
    border-color: #409eff;
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
    -webkit-appearance: none;
}

input[type="number"] {
    -moz-appearance: textfield;
    appearance: textfield;
}

.ip-input {
    margin-right: 10px;
    width: 70%;
}

.port-input {
    width: calc(30% - 10px);
}

.time-input {
    width: 60%;
    display: block;
}

.time-type-select {
    margin-left: 10px;
    width: calc(40% - 10px);
}

.tiny-button {
    margin-top: 15px;
    width: 100%;
}

.drawer-footer {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
}
</style>
