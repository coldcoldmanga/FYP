import { getReport } from "../service/reportServices";

export async function generateReportId(faultType: string, facilityId: string, year: number): Promise<string> {
    const faultTypeCode = faultType;
    const paddedFacilityId = facilityId;
    const yearCode = year.toString();
    const report = await getReport();
    const count = report.length;
    const paddedIssueNumber = count.toString();
    const reportId = `${faultTypeCode}-${paddedFacilityId}-${yearCode}-${paddedIssueNumber}`;

    return reportId;
}
