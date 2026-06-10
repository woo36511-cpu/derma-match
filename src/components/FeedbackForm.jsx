export default function FeedbackForm({ onSubmit }) {
  const options = [
    { label: "너무 건조함", value: "too_dry" },
    { label: "약간 건조함", value: "slightly_dry" },
    { label: "적당함", value: "good" },
    { label: "약간 무거움", value: "slightly_heavy" },
    { label: "너무 무거움", value: "too_heavy" }
  ];

  return (
    <div className="bg-white rounded-2xl border p-5 space-y-4">
      <h2 className="text-xl font-bold">2주 사용 후 피부 반응 체크</h2>
      <p className="text-sm text-gray-600">
        실제 사용 후 느낌을 바탕으로 다음 수분감 단계를 조정합니다.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onSubmit(option.value)}
            className="border rounded-xl py-3 px-4 text-left hover:bg-gray-50 transition"
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}