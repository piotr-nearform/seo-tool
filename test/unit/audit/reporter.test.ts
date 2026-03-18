import { describe, it, expect } from 'vitest';
import { generateAuditReport, formatAuditReport } from '../../../src/audit/reporter.js';
import type { AuditInput } from '../../../src/audit/reporter.js';

describe('generateAuditReport', () => {
  it('should produce a clean report when no issues found', () => {
    const input: AuditInput = {
      uniqueness: [],
      thinContent: [],
      brokenLinks: [],
      structuredData: [],
      totalPages: 10,
    };
    const report = generateAuditReport(input);
    expect(report.summary.totalPages).toBe(10);
    expect(report.summary.passedPages).toBe(10);
    expect(report.summary.warnedPages).toBe(0);
    expect(report.summary.failedPages).toBe(0);
    expect(report.summary.averageUniqueness).toBe(0);
    expect(report.summary.brokenLinks).toBe(0);
  });

  it('should count broken links as failures', () => {
    const input: AuditInput = {
      uniqueness: [],
      thinContent: [],
      brokenLinks: [{ source: '/page-1', target: '/missing' }],
      structuredData: [],
      totalPages: 5,
    };
    const report = generateAuditReport(input);
    expect(report.summary.failedPages).toBe(1);
    expect(report.summary.brokenLinks).toBe(1);
    expect(report.summary.passedPages).toBe(4);
  });

  it('should count thin content as warnings', () => {
    const input: AuditInput = {
      uniqueness: [],
      thinContent: [{ page: '/short', wordCount: 50, threshold: 300 }],
      brokenLinks: [],
      structuredData: [],
      totalPages: 5,
    };
    const report = generateAuditReport(input);
    expect(report.summary.warnedPages).toBe(1);
    expect(report.summary.passedPages).toBe(4);
  });

  it('should count structured data errors as failures', () => {
    const input: AuditInput = {
      uniqueness: [],
      thinContent: [],
      brokenLinks: [],
      structuredData: [{ page: '/page-1', errors: ['Missing @type'] }],
      totalPages: 3,
    };
    const report = generateAuditReport(input);
    expect(report.summary.failedPages).toBe(1);
  });

  it('should compute average uniqueness from flagged pages', () => {
    const input: AuditInput = {
      uniqueness: [
        { page: '/a', score: 0.8, nearestSibling: '/b' },
        { page: '/b', score: 0.6, nearestSibling: '/a' },
      ],
      thinContent: [],
      brokenLinks: [],
      structuredData: [],
      totalPages: 5,
    };
    const report = generateAuditReport(input);
    expect(report.summary.averageUniqueness).toBeCloseTo(0.7);
  });

  it('should not double-count a page in both failed and warned', () => {
    const input: AuditInput = {
      uniqueness: [],
      thinContent: [{ page: '/page-1', wordCount: 10, threshold: 300 }],
      brokenLinks: [{ source: '/page-1', target: '/missing' }],
      structuredData: [],
      totalPages: 3,
    };
    const report = generateAuditReport(input);
    // /page-1 is in both brokenLinks (failed) and thinContent (warn)
    // Should be counted as failed, not warned
    expect(report.summary.failedPages).toBe(1);
    expect(report.summary.warnedPages).toBe(0);
    expect(report.summary.passedPages).toBe(2);
  });

  it('should pass through checks data', () => {
    const input: AuditInput = {
      uniqueness: [{ page: '/a', score: 0.5, nearestSibling: '/b' }],
      thinContent: [{ page: '/c', wordCount: 10, threshold: 300 }],
      brokenLinks: [{ source: '/d', target: '/missing' }],
      structuredData: [{ page: '/e', errors: ['bad'] }],
      totalPages: 10,
    };
    const report = generateAuditReport(input);
    expect(report.checks.uniqueness).toEqual(input.uniqueness);
    expect(report.checks.thinContent).toEqual(input.thinContent);
    expect(report.checks.brokenLinks).toEqual(input.brokenLinks);
    expect(report.checks.structuredData).toEqual(input.structuredData);
  });
});

describe('formatAuditReport', () => {
  it('should produce readable terminal output', () => {
    const input: AuditInput = {
      uniqueness: [{ page: '/a', score: 0.5, nearestSibling: '/b' }],
      thinContent: [{ page: '/c', wordCount: 50, threshold: 300 }],
      brokenLinks: [{ source: '/d', target: '/missing' }],
      structuredData: [{ page: '/e', errors: ['Missing @type'] }],
      totalPages: 10,
    };
    const report = generateAuditReport(input);
    const output = formatAuditReport(report);
    expect(output).toContain('Audit Report');
    expect(output).toContain('Total pages: 10');
    expect(output).toContain('/a');
    expect(output).toContain('/c');
    expect(output).toContain('/missing');
    expect(output).toContain('Missing @type');
  });

  it('should handle empty report', () => {
    const input: AuditInput = {
      uniqueness: [],
      thinContent: [],
      brokenLinks: [],
      structuredData: [],
      totalPages: 0,
    };
    const report = generateAuditReport(input);
    const output = formatAuditReport(report);
    expect(output).toContain('Total pages: 0');
  });
});
