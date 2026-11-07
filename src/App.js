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
import { AccountPanel } from "./components/AccountPanel";
import { SymptomCheckScreen } from "./screens/SymptomCheckScreen";
import { SymptomResultScreen } from "./screens/SymptomResultScreen";
import { SimpleCareScreen } from "./screens/SimpleCareScreen";
import { skinSurveyQuestions } from "./data/skinSurvey";
import { RoutineSafetyNotice } from "./components/RoutineSafetyNotice";

export default function App() {
  const {
    simpleMode, simpleRecord, startSimpleSkinCare, saveSimpleSkinRecord, startCheckedFlow, surveyAnswers,
    symptomCheck, routineSafety, feedbackSafety, quickSafety, startSymptomRecheck, continueFeedback,
    account,
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
    feedbackResultRecord,
    nextRoutine,
    baseLevel,
    levelChangeMessage,
    feedbackAdvice,
    routineReason,
    ingredients,
  } = useSkinCoach();
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header resetFlow={resetFlow} isStart={step === "start"} />
      <AccountPanel account={account} />

      <main className={`max-w-5xl mx-auto px-4 sm:px-6 ${step === "start" ? "pt-4 pb-10 sm:pt-6 sm:pb-14" : "py-10 sm:py-14"}`}>
        {step === "symptomCheck" && <SymptomCheckScreen check={symptomCheck} />}
        {step === "symptomResult" && <SymptomResultScreen check={symptomCheck} setStep={setStep} />}
        {step === "start" && (
          <StartScreen
            startCheckedFlow={startCheckedFlow}
            startSimpleSkinCare={startSimpleSkinCare}
            startSymptomRecheck={startSymptomRecheck}
            symptomCheck={symptomCheck}
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

        {step === "quickRecommend" && (quickSafety.blocked ? <RoutineSafetyNotice safety={quickSafety} onRecheck={() => symptomCheck.begin("quickRecommend")} /> : (
          <QuickRecommendScreen
            setQuickLevel={setQuickLevel}
            quickLevel={quickLevel}
            quickRoutineReason={quickRoutineReason}
            quickRoutine={quickRoutine}
            setStep={setStep}
            startQuickJourneyFeedback={startQuickJourneyFeedback}
          />
        ))}
        {step === "survey" && currentSurveyQuestion && (
          <SurveyScreen
            simpleMode={simpleMode}
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

        {step === "simpleCare" && <SimpleCareScreen key={account.user?.id ?? "guest"} profile={surveyResult} surveyAnswers={surveyAnswers} initialRecord={simpleRecord} onSave={saveSimpleSkinRecord} onBack={() => { setSurveyIndex(skinSurveyQuestions.length - 1); setStep("survey"); }} onHome={() => setStep("start")} />}

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
            safety={routineSafety}
            symptomAssessment={symptomCheck.assessment}
            onSymptomRecheck={startSymptomRecheck}
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
        {step === "starter" && starterRoutine && (quickSafety.blocked ? <RoutineSafetyNotice safety={quickSafety} onRecheck={() => symptomCheck.begin("survey")} /> : (
          <StarterScreen
            starterRoutineInfo={starterRoutineInfo}
            starterRoutine={starterRoutine}
            userContext={userContext}
            setBaseLevel={setBaseLevel}
            starterLevel={starterLevel}
            setAnswers={setAnswers}
            setStep={setStep}
          />
        ))}

        {step === "feedback" && (
          <FeedbackScreen
            continueFeedback={continueFeedback}
            onSymptomRecheck={startSymptomRecheck}
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
            safety={feedbackSafety}
            symptomAssessment={symptomCheck.assessment}
            onSymptomRecheck={startSymptomRecheck}
            feedbackResultRecord={feedbackResultRecord}
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
