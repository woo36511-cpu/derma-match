import { fireEvent, render, screen } from "@testing-library/react";
import { SkinPhotoSurfaceCheck } from "./SkinPhotoSurfaceCheck";
import { observationQuestions } from "../data/observationSurvey";

jest.mock("./GuidedFacePhoto", () => ({
  GuidedFacePhoto: ({ renderConfirmation }) => renderConfirmation(["flaking"]),
}));

test("a photo finding only becomes a survey answer after confirmation", () => {
  const question = observationQuestions.find(item => item.id === "surfaceObservation");
  const flakes = question.options.find(option => option.value === "flakes");
  const onAnswer = jest.fn();
  const { rerender } = render(<SkinPhotoSurfaceCheck question={question} onAnswer={onAnswer} />);

  expect(onAnswer).not.toHaveBeenCalled();
  expect(screen.queryByRole("button", { name: /붉고 따가워요/ })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: /확인 후 답변에 반영/ }));
  expect(onAnswer).toHaveBeenCalledWith(question, flakes);

  rerender(<SkinPhotoSurfaceCheck question={question} answer={flakes.label} onAnswer={onAnswer} />);
  expect(screen.getByRole("button", { name: /답변에 반영됨/ })).toBeDisabled();
});
