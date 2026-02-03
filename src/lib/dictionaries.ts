export const getDictionary = (lang: string) => {
    console.log('[getDictionary] requesting lang:', lang);
    if (lang === 'vn') return dictionaries['vi'];

    // Use validLang logic to cover all supported languages
    const validLang = ['en', 'vi', 'kr', 'jp', 'cn'].includes(lang) ? lang : 'en';
    console.log('[getDictionary] resolved to:', validLang);
    return dictionaries[validLang as keyof typeof dictionaries];
};

const dictionaries = {
    en: {
        checkout: {
            title: "Payment Information",
            customer_info: "CUSTOMER INFO",
            full_name: "Full Name*",
            email: "Email (abc@gmail.com)*",
            phone: "Phone No.",
            gender: "Gender",
            male: "Male",
            female: "Female",
            other: "Other",
            pay_warning: "Please pay before entering the service room.",
            invoice_details: "Invoice Details",
            payment_method: "PAYMENT METHOD",
            amount_paid_title: "AMOUNT PAID", // Distinguish from modal
            reset: "Reset",
            change_title: "Change:",
            insufficient: "Insufficient",
            confirm_order_btn: "CONFIRM ORDER",

            // Modal Specific
            modal_title: "Confirming Order",
            review_text: "Please review your order before submitting.",
            customer_details: "CUSTOMER DETAILS",
            name: "Name:",
            email_label: "Email:",
            gender_label: "Gender:",
            order_summary: "ORDER SUMMARY",
            items: "items",
            strength: "Strength",
            therapist: "Therapist",
            custom_for_you_btn: "CUSTOM FOR YOU",
            strength_label: "Strength:",
            therapist_label: "Therapist:",
            focus: "Focus",
            avoid: "Avoid",
            total_duration: "Total Duration",
            total_bill: "Total Bill",
            amount_paid: "Amount Paid",
            change_due: "Change Due",
            missing: "Missing",
            general_notes: "General Notes:",
            expected_time: "EXPECTED TIME",
            start_time: "Start Time:",
            end_time: "End Time:",
            cancel: "CANCEL",
            submit: "SUBMIT",
            order_submitted: "Order Submitted",
            done: "DONE",
            processing: "Processing...",
            send_request: "Send Request",
            edit: "EDIT"
        },
        payment_methods: {
            cash_vnd: "Cash VND",
            cash_usd: "Cash USD",
            card: "Card",
            transfer: "Transfer",
            // New UI keys
            denominations: "Collected Denominations",
            exchange_rules: "Collection & Refund Rules",
            refund_note: "Change will be returned in VND.",
            accepted_cards: "Accepted Cards",
            cards_desc: "Supported payment cards",
            understood: "Understood"
        },
        common: {
            back_to_menu: "Menu"
        },
        options: {
            strength_levels: {
                light: "Light",
                medium: "Medium",
                strong: "Strong"
            },
            therapist_options: {
                random: "Random",
                male: "Male",
                female: "Female"
            }
        },
        custom_for_you: {
            title: "Custom for you",
            full_body: "Full Body",
            partly: "Partly"
        },
        body_parts: {
            foot: "Foot",
            feet: "Feet",
            head: "Head",
            neck: "Neck",
            shoulder: "Shoulder",
            back: "Back",
            back_upper: "Upper Back",
            back_lower: "Lower Back",
            arm: "Arm",
            arms: "Arms",
            hand: "Hand",
            hands: "Hands",
            thigh: "Thigh",
            leg: "Leg",
            legs: "Legs",
            calf: "Calf",
            glute: "Glute",
            // Fallback for uppercase keys just in case
            FOOT: "Foot",
            HEAD: "Head",
            NECK: "Neck",
            SHOULDER: "Shoulder",
            BACK: "Back",
            ARM: "Arm",
            THIGH: "Thigh",
            CALF: "Calf"
        },
        tags: {
            pregnant: "Pregnant",
            allergy: "Allergy"
        },
        history: {
            page_title: "Your Visits",
            modify_btn: "Modify (New)",
            rebook_btn: "Rebook This",
            create_new_btn: "+ CREATE NEW BOOKING",
            note_label: "Note"
        }
    },
    vi: {
        checkout: {
            title: "Thông tin thanh toán",
            customer_info: "THÔNG TIN KHÁCH HÀNG",
            full_name: "Họ và tên*",
            email: "Email (abc@gmail.com)*",
            phone: "Số điện thoại",
            gender: "Giới tính",
            male: "Nam",
            female: "Nữ",
            other: "Khác",
            pay_warning: "Vui lòng thanh toán trước khi vào phòng dịch vụ.",
            invoice_details: "Chi tiết hóa đơn",
            payment_method: "PHƯƠNG THỨC THANH TOÁN",
            amount_paid_title: "TIỀN ĐÃ ĐƯA",
            reset: "Đặt lại",
            change_title: "Tiền thừa:",
            insufficient: "Thiếu",
            confirm_order_btn: "XÁC NHẬN ĐƠN",

            // Modal Specific
            modal_title: "Xác nhận yêu cầu",
            review_text: "Vui lòng kiểm tra lại đơn hàng.",
            customer_details: "THÔNG TIN KHÁCH HÀNG",
            name: "Tên:",
            email_label: "Email:",
            gender_label: "Giới tính:",
            order_summary: "TÓM TẮT ĐƠN HÀNG",
            items: "món",
            strength: "Lực",
            therapist: "KTV",
            custom_for_you_btn: "TÙY CHỈNH CHO BẠN",
            strength_label: "Lực:",
            therapist_label: "KTV:",
            focus: "Tập trung",
            avoid: "Tránh",
            total_duration: "Tổng thời gian",
            total_bill: "Tổng tiền",
            amount_paid: "Tiền đã đưa",
            change_due: "Tiền thối lại",
            missing: "Thiếu",
            general_notes: "Lưu ý chung:",
            expected_time: "THỜI GIAN DỰ KIẾN",
            start_time: "Bắt đầu:",
            end_time: "Kết thúc:",
            cancel: "HỦY BỎ",
            submit: "XÁC NHẬN",
            order_submitted: "Đã gửi đơn",
            done: "Hoàn tất",
            processing: "Đang xử lý...",
            send_request: "Gửi yêu cầu",
            edit: "CHỈNH SỬA"
        },
        payment_methods: {
            cash_vnd: "Tiền mặt (VND)",
            cash_usd: "Tiền mặt (USD)",
            card: "Thẻ",
            transfer: "Chuyển khoản"
        },
        common: {
            back_to_menu: "Menu"
        },
        options: {
            strength_levels: {
                light: "Nhẹ",
                medium: "Vừa",
                strong: "Mạnh"
            },
            therapist_options: {
                random: "Ngẫu nhiên",
                male: "Nam",
                female: "Nữ"
            }
        },
        custom_for_you: {
            title: "Tùy chỉnh cho bạn",
            full_body: "Toàn thân",
            partly: "Một phần"
        },
        body_parts: {
            foot: "Chân",
            feet: "Bàn chân",
            head: "Đầu",
            neck: "Cổ",
            shoulder: "Vai",
            back: "Lưng",
            back_upper: "Lưng trên",
            back_lower: "Thắt lưng",
            arm: "Tay",
            arms: "Tay",
            hand: "Bàn tay",
            hands: "Bàn tay",
            thigh: "Đùi",
            leg: "Chân",
            legs: "Chân",
            calf: "Bắp chân",
            glute: "Mông",
            // Fallback
            FOOT: "Chân",
            HEAD: "Đầu",
            NECK: "Cổ",
            SHOULDER: "Vai",
            BACK: "Lưng",
            ARM: "Tay",
            THIGH: "Đùi",
            CALF: "Bắp chân"
        },
        tags: {
            pregnant: "Mang thai",
            allergy: "Dị ứng"
        },
        history: {
            page_title: "Lịch sử ghé thăm",
            modify_btn: "Chỉnh sửa (Mới)",
            rebook_btn: "Đặt lại đơn này",
            create_new_btn: "+ TẠO ĐƠN MỚI",
            note_label: "Lưu ý"
        }
    },
    kr: {
        checkout: {
            title: "결제 정보",
            customer_info: "고객 정보",
            full_name: "성명*",
            email: "이메일 (abc@gmail.com)*",
            phone: "전화번호",
            gender: "성별",
            male: "남성",
            female: "여성",
            other: "기타",
            pay_warning: "서비스 룸 입장 전 결제 부탁드립니다.",
            invoice_details: "청구서 세부 정보",
            payment_method: "결제 방법",
            amount_paid_title: "지불 금액",
            reset: "초기화",
            change_title: "거스름돈:",
            insufficient: "부족",
            confirm_order_btn: "주문 확인",

            // Modal Specific
            modal_title: "주문 확인",
            review_text: "제출하기 전에 주문을 확인해주세요.",
            customer_details: "고객 세부 정보",
            name: "이름:",
            email_label: "이메일:",
            gender_label: "성별:",
            order_summary: "주문 요약",
            items: "항목",
            strength: "강도",
            therapist: "테라피스트",
            custom_for_you_btn: "맞춤 설정",
            strength_label: "강도:",
            therapist_label: "테라피스트:",
            focus: "집중",
            avoid: "피할 곳",
            total_duration: "총 소요 시간",
            total_bill: "총 청구 금액",
            amount_paid: "지불 금액",
            change_due: "거스름돈",
            missing: "부족",
            general_notes: "일반 메모:",
            expected_time: "예상 시간",
            start_time: "시작 시간:",
            end_time: "종료 시간:",
            cancel: "취소",
            submit: "제출",
            order_submitted: "주문 완료",
            done: "완료",
            processing: "처리 중...",
            send_request: "요청 보내기",
            edit: "편집"
        },
        payment_methods: {
            cash_vnd: "현금 (VND)",
            cash_usd: "현금 (USD)",
            card: "카드",
            transfer: "계좌 이체"
        },
        common: {
            back_to_menu: "메뉴"
        },
        options: {
            strength_levels: {
                light: "약하게",
                medium: "보통",
                strong: "강하게"
            },
            therapist_options: {
                random: "무작위",
                male: "남성",
                female: "여성"
            }
        },
        custom_for_you: {
            title: "맞춤 설정",
            full_body: "전신",
            partly: "부분"
        },
        body_parts: {
            foot: "발",
            feet: "발",
            head: "머리",
            neck: "목",
            shoulder: "어깨",
            back: "등",
            back_upper: "등 위쪽",
            back_lower: "허리",
            arm: "팔",
            arms: "팔",
            hand: "손",
            hands: "손",
            thigh: "허벅지",
            leg: "다리",
            legs: "다리",
            calf: "종아리",
            glute: "엉덩이",
            // Fallback
            FOOT: "발",
            HEAD: "머리",
            NECK: "목",
            SHOULDER: "어깨",
            BACK: "등",
            ARM: "팔",
            THIGH: "허벅지",
            CALF: "종아리"
        },
        tags: {
            pregnant: "임산부",
            allergy: "알레르기"
        },
        history: {
            page_title: "방문 기록",
            modify_btn: "수정 (신규)",
            rebook_btn: "다시 예약",
            create_new_btn: "+ 새 예약 만들기",
            note_label: "메모"
        }
    },
    cn: {
        checkout: {
            title: "支付信息",
            customer_info: "客户信息",
            full_name: "姓名*",
            email: "邮箱 (abc@gmail.com)*",
            phone: "电话号码",
            gender: "性别",
            male: "男",
            female: "女",
            other: "其他",
            pay_warning: "请在进入服务室前付款。",
            invoice_details: "发票详情",
            payment_method: "支付方式",
            amount_paid_title: "已付金额",
            reset: "重置",
            change_title: "找零:",
            insufficient: "不足",
            confirm_order_btn: "确认订单",

            // Modal Specific
            modal_title: "确认订单",
            review_text: "提交前请检查您的订单。",
            customer_details: "客户详情",
            name: "姓名:",
            email_label: "邮箱:",
            gender_label: "性别:",
            order_summary: "订单摘要",
            items: "项目",
            strength: "力度",
            therapist: "理疗师",
            custom_for_you_btn: "为您定制",
            strength_label: "力度:",
            therapist_label: "理疗师:",
            focus: "重点",
            avoid: "避开",
            total_duration: "总时长",
            total_bill: "总费用",
            amount_paid: "已付金额",
            change_due: "找零",
            missing: "缺少",
            general_notes: "一般说明:",
            expected_time: "预计时间",
            start_time: "开始时间:",
            end_time: "结束时间:",
            cancel: "取消",
            submit: "提交",
            order_submitted: "订单已提交",
            done: "完成",
            processing: "处理中...",
            send_request: "发送请求",
            edit: "编辑"
        },
        payment_methods: {
            cash_vnd: "现金 (VND)",
            cash_usd: "现金 (USD)",
            card: "银行卡",
            transfer: "转账"
        },
        common: {
            back_to_menu: "菜单"
        },
        options: {
            strength_levels: {
                light: "轻",
                medium: "中",
                strong: "重"
            },
            therapist_options: {
                random: "随机",
                male: "男",
                female: "女"
            }
        },
        custom_for_you: {
            title: "为您定制",
            full_body: "全身",
            partly: "部分"
        },
        body_parts: {
            foot: "脚",
            feet: "脚",
            head: "头",
            neck: "脖子",
            shoulder: "肩膀",
            back: "背部",
            back_upper: "上背部",
            back_lower: "下背部",
            arm: "手臂",
            arms: "手臂",
            hand: "手",
            hands: "手",
            thigh: "大腿",
            leg: "腿",
            legs: "腿",
            calf: "小腿",
            glute: "臀部",
            // Fallback
            FOOT: "脚",
            HEAD: "头",
            NECK: "脖子",
            SHOULDER: "肩膀",
            BACK: "背部",
            ARM: "手臂",
            THIGH: "大腿",
            CALF: "小腿"
        },
        tags: {
            pregnant: "孕妇",
            allergy: "过敏"
        },
        history: {
            page_title: "访问记录",
            modify_btn: "修改 (新)",
            rebook_btn: "再次预订",
            create_new_btn: "+ 创建新预订",
            note_label: "备注"
        }
    },
    jp: {
        checkout: {
            title: "お支払い情報",
            customer_info: "お客様情報",
            full_name: "氏名*",
            email: "メール (abc@gmail.com)*",
            phone: "電話番号",
            gender: "性別",
            male: "男性",
            female: "女性",
            other: "その他",
            pay_warning: "施術室に入る前にお支払いをお願いします。",
            invoice_details: "請求書詳細",
            payment_method: "お支払い方法",
            amount_paid_title: "支払金額",
            reset: "リセット",
            change_title: "お釣り:",
            insufficient: "不足",
            confirm_order_btn: "注文を確定",

            // Modal Specific
            modal_title: "注文の確認",
            review_text: "送信する前に注文内容をご確認ください。",
            customer_details: "お客様詳細",
            name: "名前:",
            email_label: "メール:",
            gender_label: "性別:",
            order_summary: "注文概要",
            items: "アイテム",
            strength: "強さ",
            therapist: "セラピスト",
            custom_for_you_btn: "カスタム",
            strength_label: "強さ:",
            therapist_label: "セラピスト:",
            focus: "重点",
            avoid: "避ける場所",
            total_duration: "所要時間",
            total_bill: "合計金額",
            amount_paid: "支払金額",
            change_due: "お釣り",
            missing: "不足",
            general_notes: "備考:",
            expected_time: "予定時間",
            start_time: "開始時間:",
            end_time: "終了時間:",
            cancel: "キャンセル",
            submit: "送信",
            order_submitted: "注文送信完了",
            done: "完了",
            processing: "処理中...",
            send_request: "リクエスト送信",
            edit: "編集"
        },
        payment_methods: {
            cash_vnd: "現金 (VND)",
            cash_usd: "現金 (USD)",
            card: "カード",
            transfer: "銀行振込"
        },
        common: {
            back_to_menu: "メニュー"
        },
        options: {
            strength_levels: {
                light: "弱め",
                medium: "普通",
                strong: "強め"
            },
            therapist_options: {
                random: "指名なし",
                male: "男性",
                female: "女性"
            }
        },
        custom_for_you: {
            title: "カスタム",
            full_body: "全身",
            partly: "部分"
        },
        body_parts: {
            foot: "足",
            feet: "足",
            head: "頭",
            neck: "首",
            shoulder: "肩",
            back: "背中",
            back_upper: "背中上部",
            back_lower: "腰",
            arm: "腕",
            arms: "腕",
            hand: "手",
            hands: "手",
            thigh: "太もも",
            leg: "脚",
            legs: "脚",
            calf: "ふくらはぎ",
            glute: "お尻",
            // Fallback
            FOOT: "足",
            HEAD: "頭",
            NECK: "首",
            SHOULDER: "肩",
            BACK: "背中",
            ARM: "腕",
            THIGH: "太もも",
            CALF: "ふくらはぎ"
        },
        tags: {
            pregnant: "妊娠中",
            allergy: "アレルギー"
        },
        history: {
            page_title: "訪問履歴",
            modify_btn: "変更 (新規)",
            rebook_btn: "再予約",
            create_new_btn: "+ 新規予約作成",
            note_label: "メモ"
        }
    }
};
