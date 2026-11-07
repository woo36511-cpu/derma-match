import { DetailDisclosure } from "./DetailDisclosure";

const questions = [
  { question: "어떤 피부 문제인지 몰라도 되나요?", answer: "네. 피부타입이나 질환 이름 대신 어디에 올라왔는지, 어떤 모양인지, 얼마나 따갑거나 가려운지처럼 직접 느끼고 볼 수 있는 것부터 물어봐요." },
  { question: "피부 고민이 여러 개면 어떻게 하나요?", answer: "먼저 피부타입에 맞는 기본 제품을 확인해요. 여드름이나 모낭염 같은 고민이 있다면 모양과 현재 쓰는 제품을 추가로 물어보고 별도 관리 정보를 붙여드려요." },
  { question: "쓰고 있는 화장품을 전부 바꿔야 하나요?", answer: "아니요. 잘 맞는 제품은 유지하고, 현재 고민을 관리하는 데 필요한 변경부터 알려드려요." },
];

export function SeoContentSection() {
  return <section aria-labelledby="start-questions" className="space-y-3 border-t border-slate-200 px-1 pt-5">
    <h2 id="start-questions" className="text-lg font-bold text-slate-950">시작하기 전에 궁금한 점</h2>
    {questions.map(({ question, answer }) => <DetailDisclosure key={question} title={question}><p>{answer}</p></DetailDisclosure>)}
  </section>;
}
