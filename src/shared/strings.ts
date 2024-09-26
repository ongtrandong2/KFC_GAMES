export const Congratulations = (name: string): string => `
        <h1 class="title">CHÚC MỪNG</h1>
        <p class="font-bold">Bạn <strong>${name}</strong> đã nhận được</p>
    `;

export const GoodLuck = (name: string): string => `
    <h1 class="title">CHÚC BẠN<br/> MAY MẮN LẦN SAU</h1>
    <p>
        Hy vọng <strong>${name}</strong> hài lòng<br/>
        với những trải nghiệm khó quên<br/>
        cùng “Hành Trình Ký Ức”.
    </p>
`;

export const CodeSent = (name: string): string => `
    <div class="ScoreBox ScoreBoxDialog ScoreBoxDialogEmpty"></div>
    <p>
        Chúng mình đã gửi code đã gửi tin nhắn qua Zalo.<br/>
        <strong>${name}</strong> kiểm tra nhé
    </p>
`;

export const WheelWelcome = (name: string): string => `
    <h1 class="title">
        VÒNG QUAY<br>MAY MẮN
    </h1>
    <p>
        Chúc mừng <strong>${name}</strong><br/>
        hoàn thành thử thách.<br/>
        Quay vòng quay để nhận giải thôi!
    </p>
`;

export const GameResult = (name: string, score: number): string => `
    <div class="ScoreBox ScoreBoxDialog" >
        <span id="ScoreDialog" class="Score">${score}</span>
        <span>ĐIỂM</span>
    </div>
    <p>
        Bạn thật tuyệt vời!<br/>
        Cảm ơn <strong>${name}</strong> đã cùng chúng tôi<br/>
        khám phá hành trình tuổi thơ,<br/>
        Chúng mình có một món quà rất bất ngờ<br/>
        dành riêng cho <strong>${name}</strong> đó
    </p>
`;

export const ReceiveGift = "NHẬN QUÀ MAY MẮN";
export const ReceiveMore = "NHẬN THÊM ƯU ĐÃI";
export const ReceiveMoreOffers = "Nhận thêm nhiều ưu đãi khác";
export const Back = "QUAY LẠI";
export const SpinNow = "QUAY NGAY";
export const Restart = "CHƠI TIẾP";
