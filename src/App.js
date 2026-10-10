import { useSkinCoach } from "./hooks/useSkinCoach";
import { Header } from "./components/Header";
import { StartScreen } from "./screens/StartScreen";
import { JourneyScreen } from "./screens/JourneyScreen";
import { QuickRecommendScreen } from "./screens/QuickRecommendScreen";
import { SurveyScreen } from "./screens/SurveyScreen";
import { IssueSelectScreen } from "./screens/IssueSelectScreen";
import { IssueDetailScreen } from "./screens/IssueDetailScreen";
import { SurveyResultScreen } from "./screens/SurveyResultScreen";
import { StarterScreen } from "./screens/StarterScreen";
import { FeedbackScreen } from "./screens/FeedbackScreen";
import { RecheckScreen } from "./screens/RecheckScreen";
import { ResultScreen } from "./screens/ResultScreen";
import { Footer } from "./components/Footer";

export default function App() {
  const {
    resetFlow,
    step,
    setActiveJourneyId,
    setStep,
    isQuickJourney,
    quickJourneySkinType,
    quickJourneyCurrentLevel,
    feedbackCount,
    latestJourneyRecord,
    resumeQuickJourneyFeedback,
    hasSavedSurvey,
    savedSurvey,
    savedSurveyResult,
    openSavedSurveyResult,
    startSavedFeedback,
    journeyOptions,
    viewedJourneyStartRecord,
    setViewJourneyId,
    previousJourneyStartRecord,
    previousJourneyEndLevel,
    previousJourneySkinType,
    firstJourneyLevel,
    currentJourneySkinType,
    latestJourneyLevel,
    journeyTransitionMessage,
    previousJourneyConcern,
    currentJourneyStartConcern,
    activeJourneyRecords,
    latestJourneyConcern,
    journeyLevelChange,
    journeyRoundSummaries,
    setQuickLevel,
    quickLevel,
    quickRoutineReason,
    quickRoutine,
    startQuickJourneyFeedback,
    currentSurveyQuestion,
    surveyIndex,
    surveyProgress,
    currentSurveyAnswer,
    handleSurveyAnswer,
    handlePrevSurvey,
    handleNextSurvey,
    isCurrentSurveyAnswered,
    isLastSurveyQuestion,
    surveyResult,
    mainConcern,
    setIssueAnswers,
    setIssueIndex,
    setMainConcern,
    setSurveyIndex,
    saveSurveyResult,
    currentIssueQuestion,
    selectedConcern,
    issueIndex,
    activeIssueQuestions,
    issueProgress,
    currentIssueAnswer,
    handleIssueAnswer,
    handlePrevIssue,
    handleNextIssue,
    isLastIssueQuestion,
    finalSkinProfile,
    activeIssueGuide,
    surveyRoutine,
    surveyUserContext,
    setSurveyAnswers,
    starterRoutine,
    starterRoutineInfo,
    userContext,
    setBaseLevel,
    starterLevel,
    setAnswers,
    feedbackTargetProducts,
    productUsageFeedback,
    handleProductUsageAnswer,
    answers,
    handleAnswer,
    nextLevel,
    nextRoutineInfo,
    isComplete,
    feedbackSurveyAnswers,
    handleFeedbackSurveyAnswer,
    saveFeedbackResult,
    feedbackSurveyComplete,
    nextRoutine,
    baseLevel,
    levelChangeMessage,
    feedbackAdvice,
    routineReason,
    ingredients,
  } = useSkinCoach();
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header resetFlow={resetFlow} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {step === "start" && (
          <StartScreen
            setActiveJourneyId={setActiveJourneyId}
            setStep={setStep}
            isQuickJourney={isQuickJourney}
            quickJourneySkinType={quickJourneySkinType}
            quickJourneyCurrentLevel={quickJourneyCurrentLevel}
            feedbackCount={feedbackCount}
            latestJourneyRecord={latestJourneyRecord}
            resumeQuickJourneyFeedback={resumeQuickJourneyFeedback}
            hasSavedSurvey={hasSavedSurvey}
            savedSurvey={savedSurvey}
            savedSurveyResult={savedSurveyResult}
            openSavedSurveyResult={openSavedSurveyResult}
            startSavedFeedback={startSavedFeedback}
          />
        )}

        {step === "journey" && (
          <JourneyScreen
            journeyOptions={journeyOptions}
            viewedJourneyStartRecord={viewedJourneyStartRecord}
            setViewJourneyId={setViewJourneyId}
            previousJourneyStartRecord={previousJourneyStartRecord}
            previousJourneyEndLevel={previousJourneyEndLevel}
            previousJourneySkinType={previousJourneySkinType}
            firstJourneyLevel={firstJourneyLevel}
            currentJourneySkinType={currentJourneySkinType}
            latestJourneyLevel={latestJourneyLevel}
            feedbackCount={feedbackCount}
            journeyTransitionMessage={journeyTransitionMessage}
            previousJourneyConcern={previousJourneyConcern}
            currentJourneyStartConcern={currentJourneyStartConcern}
            activeJourneyRecords={activeJourneyRecords}
            latestJourneyConcern={latestJourneyConcern}
            journeyLevelChange={journeyLevelChange}
            journeyRoundSummaries={journeyRoundSummaries}
            setStep={setStep}
          />
        )}

        {step === "quickRecommend" && (
          <QuickRecommendScreen
            setQuickLevel={setQuickLevel}
            quickLevel={quickLevel}
            quickRoutineReason={quickRoutineReason}
            quickRoutine={quickRoutine}
            setStep={setStep}
            startQuickJourneyFeedback={startQuickJourneyFeedback}
          />
        )}
        {step === "survey" && currentSurveyQuestion && (
          <SurveyScreen
            surveyIndex={surveyIndex}
            surveyProgress={surveyProgress}
            currentSurveyQuestion={currentSurveyQuestion}
            currentSurveyAnswer={currentSurveyAnswer}
            handleSurveyAnswer={handleSurveyAnswer}
            handlePrevSurvey={handlePrevSurvey}
            handleNextSurvey={handleNextSurvey}
            isCurrentSurveyAnswered={isCurrentSurveyAnswered}
            isLastSurveyQuestion={isLastSurveyQuestion}
          />
        )}

        {step === "issueSelect" && (
          <IssueSelectScreen
            surveyResult={surveyResult}
            mainConcern={mainConcern}
            setIssueAnswers={setIssueAnswers}
            setIssueIndex={setIssueIndex}
            setMainConcern={setMainConcern}
            setSurveyIndex={setSurveyIndex}
            setStep={setStep}
            saveSurveyResult={saveSurveyResult}
          />
        )}

        {step === "issueDetail" && currentIssueQuestion && (
          <IssueDetailScreen
            selectedConcern={selectedConcern}
            issueIndex={issueIndex}
            activeIssueQuestions={activeIssueQuestions}
            issueProgress={issueProgress}
            currentIssueQuestion={currentIssueQuestion}
            currentIssueAnswer={currentIssueAnswer}
            handleIssueAnswer={handleIssueAnswer}
            handlePrevIssue={handlePrevIssue}
            handleNextIssue={handleNextIssue}
            isLastIssueQuestion={isLastIssueQuestion}
          />
        )}

        {step === "surveyResult" && (
          <SurveyResultScreen
            finalSkinProfile={finalSkinProfile}
            activeIssueGuide={activeIssueGuide}
            surveyRoutine={surveyRoutine}
            surveyUserContext={surveyUserContext}
            surveyResult={surveyResult}
            setSurveyAnswers={setSurveyAnswers}
            setSurveyIndex={setSurveyIndex}
            setStep={setStep}
            startSavedFeedback={startSavedFeedback}
          />
        )}
        {step === "starter" && starterRoutine && (
          <StarterScreen
            starterRoutineInfo={starterRoutineInfo}
            starterRoutine={starterRoutine}
            userContext={userContext}
            setBaseLevel={setBaseLevel}
            starterLevel={starterLevel}
            setAnswers={setAnswers}
            setStep={setStep}
          />
        )}

        {step === "feedback" && (
          <FeedbackScreen
            feedbackTargetProducts={feedbackTargetProducts}
            productUsageFeedback={productUsageFeedback}
            handleProductUsageAnswer={handleProductUsageAnswer}
            answers={answers}
            handleAnswer={handleAnswer}
            nextLevel={nextLevel}
            nextRoutineInfo={nextRoutineInfo}
            setStep={setStep}
            isComplete={isComplete}
          />
        )}

        {step === "recheck" && (
          <RecheckScreen
            feedbackSurveyAnswers={feedbackSurveyAnswers}
            handleFeedbackSurveyAnswer={handleFeedbackSurveyAnswer}
            saveFeedbackResult={saveFeedbackResult}
            feedbackSurveyComplete={feedbackSurveyComplete}
          />
        )}

        {step === "result" && nextRoutine && (
          <ResultScreen
            nextRoutineInfo={nextRoutineInfo}
            nextLevel={nextLevel}
            baseLevel={baseLevel}
            levelChangeMessage={levelChangeMessage}
            feedbackAdvice={feedbackAdvice}
            routineReason={routineReason}
            nextRoutine={nextRoutine}
            userContext={userContext}
            ingredients={ingredients}
            setStep={setStep}
            resetFlow={resetFlow}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
