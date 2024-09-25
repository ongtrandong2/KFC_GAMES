import { Prize } from "./wheel";
import SectorOne from "/src/shared/images/sector-1.png";
import SectorThree from "/src/shared/images/sector-3.png";
import SectorFive from "/src/shared/images/sector-5.png";
import ResultSectorTwo from "/src/shared/images/result-sector-2.png";
import ResultSectorThree from "/src/shared/images/result-sector-3.png";
import ResultSectorFour from "/src/shared/images/result-sector-4.png";
import ResultSectorFive from "/src/shared/images/result-sector-5.png";
import ResultSectorSix from "/src/shared/images/result-sector-6.png";
export const prizes: Prize[] = [
  {
    image: SectorOne,
    text: "Chúc bạn may mắn<br/> lần sau",
    reward: false,
    result: SectorOne,
  },
  {
    image: ResultSectorTwo,
    text: "1 Apple Watch<br/>Series 9 GPS",
    reward: true,
    result: ResultSectorTwo,
  },
  {
    image: SectorThree,
    text: "1 Phiếu Quà Tặng<br/> KFC trị giá 10.000đ",
    reward: true,
    result: ResultSectorThree,
  },
  {
    image: ResultSectorFour,
    text: "1 Máy ảnh Fujifilm<br/>Instax Mini 12",
    reward: true,
    result: ResultSectorFour,
  },
  {
    image: SectorFive,
    text: "1 vé xem phim<br/> CGV",
    reward: true,
    result: ResultSectorFive,
  },
  {
    image: ResultSectorSix,
    text: "1 Apple Airpod<br/>Pro 2023",
    reward: true,
    result: ResultSectorSix,
  },
];
