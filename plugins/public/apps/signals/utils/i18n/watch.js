/* eslint-disable @kbn/eslint/require-license-header */
import React from 'react';
import { EuiI18n } from '@elastic/eui';

export * from '../../../utils/i18n/common';

export const mustacheText = <EuiI18n token="sg.watch.mustache.text" default="{{mustache}}" />;
export const verifyHostnamesText = (
  <EuiI18n token="sg.watch.verifyHostnames.text" default="Verify hostnames" />
);
export const optionalText = <EuiI18n token="sg.watch.optional.text" default="Optional" />;
export const connectionTimeoutText = (
  <EuiI18n token="sg.watch.connectionTimeout.text" default="Connection timeout (sec)" />
);
export const readTimeoutText = (
  <EuiI18n token="sg.watch.readTimeout.text" default="Read timeout (sec)" />
);
export const certsText = <EuiI18n token="sg.watch.certs.text" default="Certs (client auth)" />;
export const trustedCertsText = (
  <EuiI18n token="sg.watch.trustedCerts.text" default="Trusted certs (CA)" />
);
export const privateKeyText = (
  <EuiI18n token="sg.watch.privateKey.text" default="Private key (client auth)" />
);
export const privateKeyPasswordText = (
  <EuiI18n token="sg.watch.privateKeyPassword.text" default="Private key password (client auth)" />
);
export const trustAllText = <EuiI18n token="sg.watch.trustAll.text" default="Trust all" />;
export const pathText = <EuiI18n token="sg.watch.path.text" default="Path" />;
export const authText = <EuiI18n token="sg.watch.auth.text" default="Auth" />;
export const queryParamsText = (
  <EuiI18n token="sg.watch.requestQueryParams.text" default="Query params" />
);
export const tookText = <EuiI18n token="sg.watch.took.text" default="Took" />;
export const totalText = <EuiI18n token="sg.watch.total.text" default="Total" />;
export const maxScoreText = <EuiI18n token="sg.watch.maxScore.text" default="Max score" />;
export const timedOutText = <EuiI18n token="sg.watch.timedOut.text" default="Timed out" />;
export const checksStatText = <EuiI18n token="sg.watch.checksStat.text" default="Checks stat" />;
export const queryStatText = <EuiI18n token="sg.watch.queryStat.text" default="Query stat" />;
export const requestText = (<EuiI18n token="sg.watch.request.text" default="Request" />);
export const targetText = (<EuiI18n token="sg.watch.target.text" default="Target" />);
export const resolvesSeverityText = (<EuiI18n token="sg.watch.resolvesSeverity.text" default="Resolves Severity" />);
export const resolvedText = (<EuiI18n token="sg.watch.resolved.text" default="Resolved" />);
export const resolveText = (<EuiI18n token="sg.watch.resolve.text" default="Resolve" />);
export const resolveActionText = (<EuiI18n token="sg.watch.resolveAction.text" default="Resolve Action" />);
export const severityText = (<EuiI18n token="sg.watch.severity.text" default="Severity" />);
export const severityThresholdsInvalidAscending = (<EuiI18n token="sg.watch.severityThresholdsInvalidAscending.text" default="Thresholds must be in ascending order and may not contain any duplicate values" />);
export const severityThresholdsInvalidDescending = (<EuiI18n token="sg.watch.severityThresholdsInvalidDescending.text" default="Thresholds must be in descending order and may not contain any duplicate values" />);
export const lastStatusText = (<EuiI18n token="sg.watch.lastStatus.text" default="Last Status" />);
export const failedText = (<EuiI18n token="sg.watch.failed.text" default="Failed" />);
export const triggeredText = (<EuiI18n token="sg.watch.triggered.text" default="Triggered" />);
export const throttledText = (<EuiI18n token="sg.watch.throttled.text" default="Throttled" />);
export const lastExecutionText = (<EuiI18n token="sg.watch.lastExecution.text" default="Last Execution" />);
export const executedText = (<EuiI18n token="sg.watch.executed.text" default="Executed" />);
export const acknowledgeText = (<EuiI18n token="sg.watch.acknowledge.text" default="Acknowledge" />);
export const acknowledgeActionText = (<EuiI18n token="sg.watch.acknowledgeAction.text" default="Acknowledge action" />);
export const acknowledgedText = (<EuiI18n token="sg.watch.acknowledged.text" default="Acknowledged" />);
export const noActionsText = (<EuiI18n token="sg.watch.noActions.text" default="No actions" />);
export const checkExamplesText = (<EuiI18n token="sg.watch.checkExamples.text" default="Check Examples" />);
export const watchesText = (<EuiI18n token="sg.watch.watches.text" default="Watches" />);
export const createWatchText = (<EuiI18n token="sg.watch.createWatch.text" default="Create Watch" />);
export const updateWatchText = (<EuiI18n token="sg.watch.updateWatch.text" default="Update Watch" />);
export const includeDataText = (<EuiI18n token="sg.watch.includeData.text" default="Include Data" />);
export const savedWatchText = (<EuiI18n token="sg.watch.savedWatch.text" default="saved watch" />);
export const checksText = (<EuiI18n token="sg.watch.checks.text" default="Checks" />);
export const checkText = (<EuiI18n token="sg.watch.check.text" default="Check" />);
export const executionHistoryText = (<EuiI18n token="sg.watch.executionHistory.text" default="Execution History" />);
export const execStartText = (<EuiI18n token="sg.watch.execStart.text" default="Exec Start" />);
export const execEndText = (<EuiI18n token="sg.watch.execEnd.text" default="Exec End" />);
export const statusText = (<EuiI18n token="sg.watch.status.text" default="Status" />);
export const numOfChecksText = (<EuiI18n token="sg.watch.numOfChecks.text" default="Num Of Checks" />);
export const numOfActionsText = (<EuiI18n token="sg.watch.numOfActions.text" default="Num Of Actions" />);
export const isActiveText = (<EuiI18n token="sg.watch.isActive.text" default="Is Active" />);
export const scheduleText = (<EuiI18n token="sg.watch.schedule.text" default="Schedule" />);
export const indexText = (<EuiI18n token="sg.watch.index.text" default="Index" />);
export const selectIndicesText = (<EuiI18n token="sg.watch.selectIndices.text" default="Select indices" />);
export const putAsteriskToQueryIndicesUsingWildcardText = (
  <EuiI18n
    token="sg.watch.putAsteriskToQueryIndicesUsingWildcard.text"
    default="Put '*' to query indices using wildcard"
  />
);
export const cronExpressionText = (<EuiI18n token="sg.watch.cronExpression.text" default="Cron expression" />);
export const minutesText = (<EuiI18n token="sg.watch.minutes.text" default="at minute(s)" />);
export const mustSelectAMinuteText = (<EuiI18n token="sg.watch.mustSelectAMinute.text" default="At least one minute is required for the hourly schedule" />);
export const invalidMinuteValuesText = (<EuiI18n token="sg.watch.mustSelectAMinute.text" default="Minutes must be a number between 0 and 59" />);
export const everyText = (<EuiI18n token="sg.watch.every.text" default="Every" />);
export const aroundText = (<EuiI18n token="sg.watch.around.text" default="Around" />);
export const modeText = (<EuiI18n token="sg.watch.mode.text" default="Mode" />);
export const byIntervalText = (<EuiI18n token="sg.watch.byInterval.text" default="By interval" />);
export const mustSelectADayText = (<EuiI18n token="sg.watch.mustSelectADay.text" default="Must select a day" />);
export const timeFieldText = (<EuiI18n token="sg.watch.timeField.text" default="Time field" />);
export const theFieldUsedFotXAxisText = (<EuiI18n token="sg.watch.theFieldUsedFotXAxis.text" default="The field used for X-Axis" />);
export const previewText = (<EuiI18n token="sg.watch.preview.text" default="Preview" />);
export const executeWatchToSeeResultText = (
  <EuiI18n token="sg.watch.executeWatchToSeeResult.text" default="Execute watch to see result" />
);
export const selectConditionToRenderGraphToSeeResultsText = (
  <EuiI18n token="sg.watch.selectConditionToRenderGraphToSeeResultsText.text" default="Select condition to render graph to see results" />
);

export function runtimeDataText(isUpperCase = false) {
  const text = isUpperCase ? 'Runtime data' : 'runtime data';
  return <EuiI18n token="sg.watch.runtimeDataText.text" default={text} />;
}

export function rowHelpTextMustacheRuntimeDataFieldText(runtimeDataLink, mustacheLink, htmlLink) {
  if (htmlLink) {
    return (
      <EuiI18n
        token="sg.watch.rowHelpTextMustacheField.text"
        default="Use {mustacheLink} templates and {htmlLink} to insert dynamic {runtimeDataLink}"
        values={{ runtimeDataLink, htmlLink, mustacheLink }}
      />
    );
  }

  return (
    <EuiI18n
      token="sg.watch.rowHelpTextMustacheField.text"
      default="Use {mustacheLink} templates to insert dynamic {runtimeDataLink}"
      values={{ runtimeDataLink, mustacheLink }}
    />
  );
}

export const watchExamplesText = (<EuiI18n token="sg.watch.watchExamples.text" default="Watch Examples" />);
export const fromText = (<EuiI18n token="sg.watch.from.text" default="From" />);
export const toText = (<EuiI18n token="sg.watch.to.text" default="To" />);
export const ccText = (<EuiI18n token="sg.watch.cc.text" default="Cc" />);
export const bccText = (<EuiI18n token="sg.watch.bcc.text" default="Bcc" />);
export const subjectText = (<EuiI18n token="sg.watch.subject.text" default="Subject" />);
export const iconEmojiText = (<EuiI18n token="sg.watch.iconEmoji.text" default="Icon Emoji" />);
export const timezoneText = (<EuiI18n token="sg.watch.timezone.text" default="Timezone" />);
export const youMustSpecifyIndexText = (<EuiI18n token="sg.watch.youMustSpecifyIndex.text" default="You must specify index" />);
export const youMustSpecifyATimeFieldText = (
  <EuiI18n token="sg.watch.youMustSpecifyATimeField.text" default="You must specify a time field" />
);
export const noChecksText = (<EuiI18n token="sg.watch.noChecks.text" default="No Checks!" />);
export const looksLikeYouDontHaveAnyCheckText = (
  <EuiI18n token="sg.watch.emptyChecksBlocks.text" default="Looks like you don&rsquo;t have any check. Let&rsquo;s add some!" />
);
export const executeOnlyThisBlockText = (
  <EuiI18n token="sg.watch.executeOnlyThisBlock.text" default="Execute only this block" />
);
export const executeBlocksAboveAndThisBlockText = (
  <EuiI18n token="sg.watch.executeBlocksAboveAndThisBlock.text" default="Execute blocks above and this block" />
);
export const mustSpecifyIndexText = (
  <EuiI18n token="sg.watch.mustSpecifyIndex.text" default="Must specify index" />
);
export const invalidTimeIntervalText = (
  <EuiI18n token="sg.watch.invalidTimeInterval.text" default="Invalid time interval, check the units order" />
);
export const invalidThrottleTimeIntervalText = (
  <EuiI18n token="sg.watch.invalidThrottleTimeInterval.text" default="Invalid throttle time interval, check the units order" />
);
export const addedCheckTemplateText = (
  <EuiI18n token="sg.watch.addedCheckTemplate.text" default="Added check template" />
);
export const issueText = <EuiI18n token="sg.watch.issueType.text" default="Issue" />;
export const summaryText = <EuiI18n token="sg.watch.summary.text" default="Summary" />;
export const projectText = <EuiI18n token="sg.watch.project.text" default="Project" />;
export const labelText = <EuiI18n token="sg.watch.label.text" default="Label" />;
export const priorityText = <EuiI18n token="sg.watch.priority.text" default="Priority" />;
export const parentText = <EuiI18n token="sg.watch.parent.text" default="Parent" />;
export const componentText = <EuiI18n token="sg.watch.component.text" default="Component" />;
export const dedupKeyText = <EuiI18n token="sg.watch.dedupKey.text" default="Dedup Key" />;
export const sourceText = <EuiI18n token="sg.watch.source.text" default="Source" />;
export const eventText = <EuiI18n token="sg.watch.event.text" default="Event" />;
export const customDetailsText = (
  <EuiI18n token="sg.watch.customDetails.text" default="Custom Details" />
);
export const matchConditionText = (
  <EuiI18n token="sg.watch.matchCondition.text" default="Match condition" />
);
export const leaveInputEmptyToOmitThresholdLevelText = (
  <EuiI18n
    token="sg.watch.leaveInputEmptyToOmitThresholdLevel.text"
    default="Leave input empty to omit threshold level"
  />
);
export const textBodyText = <EuiI18n token="sg.watch.textBody.text" default="Text Body" />;
export const htmlBodyText = <EuiI18n token="sg.watch.htmlBody.text" default="HTML Body" />;
