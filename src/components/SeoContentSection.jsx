import { DetailDisclosure } from "./DetailDisclosure";

const questions = [
  { question: "어떤 피부 문제인지 몰라도 되나요?", answer: "네. 피부타입이나 질환 이름 대신 어디에 올라왔는지, 어떤 모양인지, 얼마나 따갑거나 가려운지처럼 직접 느끼고 볼 수 있는 것부터 물어봐요." },
  { question: "피부 고민이 여러 개면 어떻게 하나요?", answer: "가장 신경 쓰이는 문제를 먼저 고르고, 함께 관리할 고민을 여러 개 선택할 수 있어요. 결과에서 먼저 할 일과 지금 같이 할 일, 피부가 편안해진 뒤 할 일을 나눠 보여드려요." },
  { question: "쓰고 있는 화장품을 전부 바꿔야 하나요?", answer: "아니요. 잘 맞는 제품은 유지하고, 현재 고민을 관리하는 데 필요한 변경부터 알려드려요." },
];

export function SeoContentSection() {
  return <section aria-labelledby="start-questions" className="space-y-3 border-t border-slate-200 px-1 pt-5">
    <h2 id="start-questions" className="text-lg font-bold text-slate-950">시작하기 전에 궁금한 점</h2>
    {questions.map(({ question, answer }) => <DetailDisclosure key={question} title={question}><p>{answer}</p></DetailDisclosure>)}
  </section>;
}
