export class GetActivityLogsQuery {
  constructor(
    public readonly userId?: string,
    public readonly action?: string,
    public readonly startDate?: string,
    public readonly endDate?: string,
    public readonly limit?: number,
  ) {}
}
