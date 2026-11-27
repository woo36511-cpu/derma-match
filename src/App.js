import { Analytics } from '@vercel/analytics/react';
import { SkinPhotoStartScreen } from "./screens/SkinPhotoStartScreen";
import { useSkinCoach } from "./hooks/useSkinCoach";
import { Header } from "./components/Header";
import { BasicRoutineTrialScreen } from "./screens/BasicRoutineTrialScreen";
import { StartScreen } from "./screens/StartScreen";
import { JourneyScreen } from "./screens/JourneyScreen";
import { QuickRecommendScreen } from "./screens/QuickRecommendScreen";
import { SurveyScreen } from "./screens/SurveyScreen";
import { IssueSelectScreen } from "./screens/IssueSelectScreen";
import { IssueDetailScreen } from "./screens/IssueDetailScreen";
import { SurveyResultScreen } from "./screens/SurveyResultScreen";
import { StarterScreen } from "./screens/StarterScreen";
import { MoisturizerObservationScreen } from "./screens/MoisturizerObservationScreen";
import { ConcernCheckScreen } from "./screens/ConcernCheckScreen";
import { FeedbackScreen } from "./screens/FeedbackScreen";
import { RecheckScreen } from "./screens/RecheckScreen";
import { ResultScreen } from "./screens/ResultScreen";
import { Footer } from "./components/Footer";
import { AccountPanel } from "./components/AccountPanel";
import { SymptomCheckScreen } from "./screens/SymptomCheckScreen";
import { SymptomResultScreen } from "./screens/SymptomResultScreen";
import { SimpleCareScreen } from "./screens/SimpleCareScreen";
import { RoutineProductLookup } from "./components/RoutineProductLookup";
import { RoutineSafetyNotice } from "./components/RoutineSafetyNotice";
import { RoutineIntakeScreen } from "./screens/RoutineIntakeScreen";
import { readRoutineSurveyContext } from "./data/routineSurveyContext";

export default function App() {
  const {
    skinPhotoFeatures, continueFromSkinPhoto, personalProductFeedback, ownerKey, currentRoutine, currentRoutineContext, simpleMode, simpleRecord, startSimpleSkinCare, completeRoutineIntake, saveSimpleSkinRecord, startCheckedFlow, surveyAnswers,
    symptomCheck, concernCheck, concernCheckHistory, moisturizerObservation, routineSafety, feedbackSafety, quickSafety, startSymptomRecheck, continueFeedback,
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
    activeSurveyQuestions, feedbackQuestionsForSkin,
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
    concernTracking,
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
  const lastSymptom = symptomCheck.latestRecord;
  const routineReview = {
    ownerKey, currentRoutine, currentRoutineContext, personalProductFeedback,
    loading: account.authLoading,
    profile: savedSurveyResult,
    savedAt: savedSurvey?.savedAt,
    safetyBlocked: savedSurvey?.symptomAssessment?.blockRoutine === true ||
      Boolean(lastSymptom?.savedAt >= (savedSurvey?.savedAt ?? "") && lastSymptom?.symptomAssessment?.blockRoutine),
  };
  return (
    <div className="min-h-screen bg-paper text-ink">
      <Header resetFlow={resetFlow} isStart={step === "start"} />
      <AccountPanel account={account} />

      <main className={`max-w-5xl mx-auto px-4 sm:px-6 ${step === "start" ? "pt-4 pb-10 sm:pt-6 sm:pb-14" : "py-10 sm:py-14"}`}>
        {step === "symptomCheck" && <SymptomCheckScreen check={symptomCheck} />}
        {step === "symptomResult" && <SymptomResultScreen check={symptomCheck} setStep={setStep} currentRoutine={currentRoutineContext} personalProductFeedback={personalProductFeedback} routineReview={routineReview}
          onRecordConcern={symptomCheck.returningToConcernCheck ? concernCheck.resume : concernCheck.canStart ? concernCheck.start : undefined} />}
        {step === "concernCheck" && <ConcernCheckScreen check={concernCheck} onHome={() => setStep("start")} onDetailedFeedback={startSavedFeedback} />}
        {step === "moisturizerObservation" && <MoisturizerObservationScreen key={JSON.stringify([account.user?.id, moisturizerObservation.record?.id, moisturizerObservation.offer?.kind])} observation={moisturizerObservation} routineReview={routineReview} onRecommend={startSimpleSkinCare} onHome={() => setStep("start")} />}
        {step === "start" && (
          <StartScreen
            startCheckedFlow={startCheckedFlow}
            startSimpleSkinCare={startSimpleSkinCare}
            setQuickLevel={setQuickLevel}
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
            onQuickConcernCheck={concernCheck.canStart ? concernCheck.start : undefined}
            onMoisturizerCheck={moisturizerObservation.available ? moisturizerObservation.resume : undefined}
            routineReview={routineReview}
          />
        )}

        {step === "basicRoutineTrial" && <BasicRoutineTrialScreen key={ownerKey} ownerKey={ownerKey}
          blocked={routineReview.safetyBlocked} currentRoutine={currentRoutineContext} personalProductFeedback={personalProductFeedback}
          onHome={() => setStep("start")} />}
        {step === "routineReview" && <div className="space-y-4">
          <RoutineProductLookup {...routineReview} onStartSurvey={startSimpleSkinCare} />
          <button type="button" onClick={() => setStep("start")} className="rounded-xl border px-4 py-3 text-sm font-semibold">시작 화면으로</button>
        </div>}

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
            concernCheckHistory={concernCheckHistory}
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
        {step === "skinPhotoStart" && <SkinPhotoStartScreen key={ownerKey} onContinue={continueFromSkinPhoto} onBack={() => setStep("start")} />}
        {step === "routineIntake" && <RoutineIntakeScreen key={ownerKey} previous={readRoutineSurveyContext(surveyAnswers.routineIntake)}
          routineReview={routineReview} onNext={completeRoutineIntake} onBack={() => setStep("start")} />}

        {step === "survey" && currentSurveyQuestion && (
          <SurveyScreen
            simpleMode={simpleMode}
            skinPhotoFeatures={skinPhotoFeatures}
            afterRoutineIntake={Boolean(simpleMode && readRoutineSurveyContext(surveyAnswers.routineIntake))}
            surveyIndex={surveyIndex}
            surveyProgress={surveyProgress}
            questionsCount={activeSurveyQuestions.length}
            currentSurveyQuestion={currentSurveyQuestion}
            currentSurveyAnswer={currentSurveyAnswer}
            changedProductId={surveyAnswers.changedProductId}
            reactionProductId={surveyAnswers.reactionProductId}
            handleSurveyAnswer={handleSurveyAnswer}
            handlePrevSurvey={handlePrevSurvey}
            handleNextSurvey={handleNextSurvey}
            isCurrentSurveyAnswered={isCurrentSurveyAnswered}
            isLastSurveyQuestion={isLastSurveyQuestion}
          />
        )}

        {step === "simpleCare" && <SimpleCareScreen key={account.user?.id ?? "guest"} profile={surveyResult} surveyAnswers={surveyAnswers} reviseSurveyAnswer={handleSurveyAnswer} skinPhotoFeatures={skinPhotoFeatures} initialRecord={simpleRecord} currentRoutineEntries={currentRoutine.entries} routineReview={routineReview} priorSerumPreference={savedSurvey?.routinePreferences?.serum} personalProductFeedback={personalProductFeedback} observation={moisturizerObservation} onRestart={startSimpleSkinCare} onRecheck={startSavedFeedback} onReviewRoutine={() => setStep("routineReview")} onSave={saveSimpleSkinRecord} onBack={() => { setSurveyIndex(activeSurveyQuestions.length - 1); setStep("survey"); }} onHome={() => setStep("start")} />}

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
            onQuickConcernCheck={concernCheck.canStart ? concernCheck.start : undefined}
            routineReview={routineReview}
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
            routineReview={routineReview}
            safetyBlocked={feedbackSafety.blocked || routineReview.safetyBlocked}
            feedbackTargetProducts={feedbackTargetProducts}
            concernTracking={concernTracking}
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
            questions={feedbackQuestionsForSkin}
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
      <Analytics />
    </div>
  );
}
