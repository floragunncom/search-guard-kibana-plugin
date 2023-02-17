/* eslint-disable @osd/eslint/require-license-header */
import React from 'react';
import { EuiI18n } from '@elastic/eui';

export * from '../../../utils/i18n/common';

export const mustacheText = <EuiI18n token="ap.watch.mustache.text" default="{{mustache}}" />;
export const verifyHostnamesText = (
  <EuiI18n token="ap.watch.verifyHostnames.text" default="Verify hostnames" />
);
export const optionalText = <EuiI18n token="ap.watch.optional.text" default="Optional" />;
export const connectionTimeoutText = (
  <EuiI18n token="ap.watch.connectionTimeout.text" default="Connection timeout (sec)" />
);
export const readTimeoutText = (
  <EuiI18n token="ap.watch.readTimeout.text" default="Read timeout (sec)" />
);
export const certsText = <EuiI18n token="ap.watch.certs.text" default="Certs (client auth)" />;
export const trustedCertsText = (
  <EuiI18n token="ap.watch.trustedCerts.text" default="Trusted certs (CA)" />
);
export const privateKeyText = (
  <EuiI18n token="ap.watch.privateKey.text" default="Private key (client auth)" />
);
export const privateKeyPasswordText = (
  <EuiI18n token="ap.watch.privateKeyPassword.text" default="Private key password (client auth)" />
);
export const trustAllText = <EuiI18n token="ap.watch.trustAll.text" default="Trust all" />;
export const pathText = <EuiI18n token="ap.watch.path.text" default="Path" />;
export const authText = <EuiI18n token="ap.watch.auth.text" default="Auth" />;
export const queryParamsText = (
  <EuiI18n token="ap.watch.requestQueryParams.text" default="Query params" />
);
export const tookText = <EuiI18n token="ap.watch.took.text" default="Took" />;
export const totalText = <EuiI18n token="ap.watch.total.text" default="Total" />;
export const maxScoreText = <EuiI18n token="ap.watch.maxScore.text" default="Max score" />;
export const timedOutText = <EuiI18n token="ap.watch.timedOut.text" default="Timed out" />;
export const checksStatText = <EuiI18n token="ap.watch.checksStat.text" default="Checks stat" />;
export const queryStatText = <EuiI18n token="ap.watch.queryStat.text" default="Query stat" />;
export const requestText = (<EuiI18n token="ap.watch.request.text" default="Request" />);
export const targetText = (<EuiI18n token="ap.watch.target.text" default="Target" />);
export const resolvesSeverityText = (<EuiI18n token="ap.watch.resolvesSeverity.text" default="Resolves Severity" />);
export const resolvedText = (<EuiI18n token="ap.watch.resolved.text" default="Resolved" />);
export const resolveText = (<EuiI18n token="ap.watch.resolve.text" default="Resolve" />);
export const resolveActionText = (<EuiI18n token="ap.watch.resolveAction.text" default="Resolve Action" />);
export const severityText = (<EuiI18n token="ap.watch.severity.text" default="Severity" />);
export const severityThresholdsInvalidAscendingText = (<EuiI18n token="ap.watch.severityThresholdsInvalidAscending.text" default="Thresholds must be in ascending order and may not contain any duplicate values" />);
export const severityThresholdsInvalidDescendingText = (<EuiI18n token="ap.watch.severityThresholdsInvalidDescending.text" default="Thresholds must be in descending order and may not contain any duplicate values" />);
export const lastStatusText = (<EuiI18n token="ap.watch.lastStatus.text" default="Last Status" />);
export const failedText = (<EuiI18n token="ap.watch.failed.text" default="Failed" />);
export const triggeredText = (<EuiI18n token="ap.watch.triggered.text" default="Triggered" />);
export const throttledText = (<EuiI18n token="ap.watch.throttled.text" default="Throttled" />);
export const lastExecutionText = (<EuiI18n token="ap.watch.lastExecution.text" default="Last Execution" />);
export const executedText = (<EuiI18n token="ap.watch.executed.text" default="Executed" />);
export const acknowledgeText = (<EuiI18n token="ap.watch.acknowledge.text" default="Acknowledge" />);
export const acknowledgeActionText = (<EuiI18n token="ap.watch.acknowledgeAction.text" default="Acknowledge action" />);
export const acknowledgedText = (<EuiI18n token="ap.watch.acknowledged.text" default="Acknowledged" />);
export const noActionsText = (<EuiI18n token="ap.watch.noActions.text" default="No actions" />);
export const checkExamplesText = (<EuiI18n token="ap.watch.checkExamples.text" default="Check Examples" />);
export const watchesText = (<EuiI18n token="ap.watch.watches.text" default="Watches" />);
export const watchText = (<EuiI18n token="ap.watch.watch.text" default="Watch" />);
export const watchJsonText = (<EuiI18n token="ap.watch.watchJson.text" default="Watch JSON" />);
export const createWatchText = (<EuiI18n token="ap.watch.createWatch.text" default="Create Watch" />);
export const updateWatchText = (<EuiI18n token="ap.watch.updateWatch.text" default="Update Watch" />);
export const readWatchText = (<EuiI18n token="ap.watch.readWatch.text" default="Read Watch" />);
export const includeDataText = (<EuiI18n token="ap.watch.includeData.text" default="Include Data" />);
export const savedWatchText = (<EuiI18n token="ap.watch.savedWatch.text" default="saved watch" />);
export const checksText = (<EuiI18n token="ap.watch.checks.text" default="Checks" />);
export const checkText = (<EuiI18n token="ap.watch.check.text" default="Check" />);
export const executionHistoryText = (<EuiI18n token="ap.watch.executionHistory.text" default="Execution History" />);
export const execStartText = (<EuiI18n token="ap.watch.execStart.text" default="Exec Start" />);
export const execEndText = (<EuiI18n token="ap.watch.execEnd.text" default="Exec End" />);
export const statusText = (<EuiI18n token="ap.watch.status.text" default="Status" />);
export const numOfChecksText = (<EuiI18n token="ap.watch.numOfChecks.text" default="Num Of Checks" />);
export const numOfActionsText = (<EuiI18n token="ap.watch.numOfActions.text" default="Num Of Actions" />);
export const isActiveText = (<EuiI18n token="ap.watch.isActive.text" default="Is Active" />);
export const scheduleText = (<EuiI18n token="ap.watch.schedule.text" default="Schedule" />);
export const indexText = (<EuiI18n token="ap.watch.index.text" default="Index" />);
export const selectIndicesText = (<EuiI18n token="ap.watch.selectIndices.text" default="Select indices" />);
export const putAsteriskToQueryIndicesUsingWildcardText = (
  <EuiI18n
    token="ap.watch.putAsteriskToQueryIndicesUsingWildcard.text"
    default="Put '*' to query indices using wildcard"
  />
);
export const cronExpressionText = (<EuiI18n token="ap.watch.cronExpression.text" default="Cron expression" />);
export const minutesText = (<EuiI18n token="ap.watch.minutes.text" default="at minute(s)" />);
export const mustSelectAMinuteText = (<EuiI18n token="ap.watch.mustSelectAMinute.text" default="At least one minute is required for the hourly schedule" />);
export const invalidMinuteValuesText = (<EuiI18n token="ap.watch.mustSelectAMinute.text" default="Minutes must be a number between 0 and 59" />);
export const everyText = (<EuiI18n token="ap.watch.every.text" default="Every" />);
export const aroundText = (<EuiI18n token="ap.watch.around.text" default="Around" />);
export const modeText = (<EuiI18n token="ap.watch.mode.text" default="Mode" />);
export const byIntervalText = (<EuiI18n token="ap.watch.byInterval.text" default="By interval" />);
export const mustSelectADayText = (<EuiI18n token="ap.watch.mustSelectADay.text" default="Must select a day" />);
export const timeFieldText = (<EuiI18n token="ap.watch.timeField.text" default="Time field" />);
export const theFieldUsedFotXAxisText = (<EuiI18n token="ap.watch.theFieldUsedFotXAxis.text" default="The field used for X-Axis" />);
export const previewText = (<EuiI18n token="ap.watch.preview.text" default="Preview" />);
export const executeWatchToSeeResultText = (
  <EuiI18n token="ap.watch.executeWatchToSeeResult.text" default="Execute watch to see result" />
);
export const selectConditionToRenderGraphToSeeResultsText = (
  <EuiI18n token="ap.watch.selectConditionToRenderGraphToSeeResultsText.text" default="Select condition to render graph to see results" />
);

export function runtimeDataText(isUpperCase = false) {
  const text = isUpperCase ? 'Runtime data' : 'runtime data';
  return <EuiI18n token="ap.watch.runtimeDataText.text" default={text} />;
}

export function rowHelpTextMustacheRuntimeDataFieldText(runtimeDataLink, mustacheLink, htmlLink) {
  if (htmlLink) {
    return (
      <EuiI18n
        token="ap.watch.rowHelpTextMustacheField.text"
        default="Use {mustacheLink} templates and {htmlLink} to insert dynamic {runtimeDataLink}"
        values={{ runtimeDataLink, htmlLink, mustacheLink }}
      />
    );
  }

  return (
    <EuiI18n
      token="ap.watch.rowHelpTextMustacheField.text"
      default="Use {mustacheLink} templates to insert dynamic {runtimeDataLink}"
      values={{ runtimeDataLink, mustacheLink }}
    />
  );
}

export const watchExamplesText = (<EuiI18n token="ap.watch.watchExamples.text" default="Watch Examples" />);
export const fromText = (<EuiI18n token="ap.watch.from.text" default="From" />);
export const toText = (<EuiI18n token="ap.watch.to.text" default="To" />);
export const ccText = (<EuiI18n token="ap.watch.cc.text" default="Cc" />);
export const bccText = (<EuiI18n token="ap.watch.bcc.text" default="Bcc" />);
export const subjectText = (<EuiI18n token="ap.watch.subject.text" default="Subject" />);
export const iconEmojiText = (<EuiI18n token="ap.watch.iconEmoji.text" default="Icon Emoji" />);
export const timezoneText = (<EuiI18n token="ap.watch.timezone.text" default="Timezone" />);
export const youMustSpecifyIndexText = (<EuiI18n token="ap.watch.youMustSpecifyIndex.text" default="You must specify an index" />);
export const youMustSpecifyATimeFieldText = (
  <EuiI18n token="ap.watch.youMustSpecifyATimeField.text" default="You must specify a time field" />
);
export const noChecksText = (<EuiI18n token="ap.watch.noChecks.text" default="No Checks!" />);
export const looksLikeYouDontHaveAnyCheckText = (
  <EuiI18n token="ap.watch.emptyChecksBlocks.text" default="Looks like you don&rsquo;t have any check. Let&rsquo;s add some!" />
);
export const executeOnlyThisBlockText = (
  <EuiI18n token="ap.watch.executeOnlyThisBlock.text" default="Execute only this block" />
);
export const executeBlocksAboveAndThisBlockText = (
  <EuiI18n token="ap.watch.executeBlocksAboveAndThisBlock.text" default="Execute blocks above and this block" />
);
export const mustSpecifyIndexText = (
  <EuiI18n token="ap.watch.mustSpecifyIndex.text" default="Must specify index" />
);
export const invalidTimeIntervalText = (
  <EuiI18n token="ap.watch.invalidTimeInterval.text" default="Invalid time interval, check the units order" />
);
export const invalidThrottleTimeIntervalText = (
  <EuiI18n token="ap.watch.invalidThrottleTimeInterval.text" default="Invalid throttle time interval, check the units order" />
);
export const addedCheckTemplateText = (
  <EuiI18n token="ap.watch.addedCheckTemplate.text" default="Added check template" />
);
export const issueText = <EuiI18n token="ap.watch.issueType.text" default="Issue" />;
export const summaryText = <EuiI18n token="ap.watch.summary.text" default="Summary" />;
export const projectText = <EuiI18n token="ap.watch.project.text" default="Project" />;
export const labelText = <EuiI18n token="ap.watch.label.text" default="Label" />;
export const priorityText = <EuiI18n token="ap.watch.priority.text" default="Priority" />;
export const parentText = <EuiI18n token="ap.watch.parent.text" default="Parent" />;
export const componentText = <EuiI18n token="ap.watch.component.text" default="Component" />;
export const dedupKeyText = <EuiI18n token="ap.watch.dedupKey.text" default="Dedup Key" />;
export const sourceText = <EuiI18n token="ap.watch.source.text" default="Source" />;
export const eventText = <EuiI18n token="ap.watch.event.text" default="Event" />;
export const customDetailsText = (
  <EuiI18n token="ap.watch.customDetails.text" default="Custom Details" />
);
export const matchConditionText = (
  <EuiI18n token="ap.watch.matchCondition.text" default="Match condition" />
);
export const leaveInputEmptyToOmitThresholdLevelText = (
  <EuiI18n
    token="ap.watch.leaveInputEmptyToOmitThresholdLevel.text"
    default="Leave input empty to omit threshold level"
  />
);
export const textBodyText = <EuiI18n token="ap.watch.textBody.text" default="Text Body" />;
export const htmlBodyText = <EuiI18n token="ap.watch.htmlBody.text" default="HTML Body" />;
