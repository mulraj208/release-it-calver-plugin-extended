import {expect} from 'chai';
import CalverPlugin from './calver-plugin.js';

const formatMonth = (date) => "" + (date.getMonth() + 1);
const formatYear = (date, fullYear = false) => "" + (date.getFullYear() - (fullYear ? 0 : 2000));

function versionFromDate(date, minor = 0, fullYear = false) {
  return `${formatYear(date, fullYear)}.${formatMonth(date)}.${minor}`;
}


describe('plugin', function () {
  it('should bump calendar when incrementing in a new month', function () {

    const before = new Date();
    before.setMonth(before.getMonth() - 2);
    const latestVersion = versionFromDate(before);
    const incrementedVersion = new CalverPlugin().getIncrementedVersion({latestVersion});

    const now = new Date();
    expect(incrementedVersion).to.equal(`${formatYear(now)}.${formatMonth(now)}.0`);
  });

  it('should bump minor when incrementing twice in the same month', function () {
    const now = new Date();
    const incrementedVersion = new CalverPlugin().getIncrementedVersion({latestVersion: versionFromDate(now)});
    expect(incrementedVersion).to.equal(versionFromDate(now, 1));
  });

  it('should acccept an increment option', function () {
    const before = new Date();
    before.setMonth(before.getMonth() - 2);
    const latestVersion = versionFromDate(before);
    const plugin = new CalverPlugin();
    plugin.setContext({increment: 'minor'});
    const incrementedVersion = plugin.getIncrementedVersion({latestVersion});
    expect(incrementedVersion).to.equal(versionFromDate(before, 1));
  });

  it('should accept a format option', function () {
    const now = new Date();
    const latestVersion = versionFromDate(now, 0, true);
    const plugin = new CalverPlugin();
    plugin.setContext({format: 'yyyy.mm.minor'});
    const incrementedVersion = plugin.getIncrementedVersion({latestVersion});
    expect(incrementedVersion).to.equal(versionFromDate(now, 1, true));
  });

  it('should support alpha increment', function () {
    const version = '2021.1.1.0-alpha.0';
    const plugin = new CalverPlugin();
    plugin.setContext({'increment': 'alpha', 'format': 'yyyy.mm.minor.patch'});
    const incrementedVersion = plugin.getIncrementedVersion({latestVersion: version});
    expect(incrementedVersion).to.equal('2021.1.1.0-alpha.1');
  });

  it('should support both calendar and semantic tags in increment', function () {
    const now = new Date();
    const latestVersion = '21.1.5';
    const plugin = new CalverPlugin();
    plugin.setContext({'increment': 'calendar.minor'});
    const firstBump = plugin.getIncrementedVersion({latestVersion});
    const secondBump = plugin.getIncrementedVersion({latestVersion: firstBump});
    const incrementedVersions = [firstBump, secondBump];
    const expectedVersions = [versionFromDate(now, 0), versionFromDate(now, 1)];
    expect(incrementedVersions).deep.to.equal(expectedVersions);
  });

  it('should work by calling getIncrement()', function () {
    const version = '2021.1.1.0';
    const plugin = new CalverPlugin();
    plugin.setContext({'increment': 'minor', 'format': 'yyyy.mm.minor.patch'});
    const incrementedVersion = plugin.getIncrement({latestVersion: version});
    expect(incrementedVersion).to.equal('2021.1.2.0');
  });    
  
  it('should work by calling getIncrementedVersionCI()', function () {
    const version = '2021.1.1.0';
    const plugin = new CalverPlugin();
    plugin.setContext({'increment': 'minor', 'format': 'yyyy.mm.minor.patch'});
    const incrementedVersion = plugin.getIncrementedVersionCI({latestVersion: version});
    expect(incrementedVersion).to.equal('2021.1.2.0');
  });

  it('should normalize version by stripping leading zeros', () => {
    const plugin = new CalverPlugin();
    const normalized = plugin.normalizeVersion('2025.07.05.01.001');
    expect(normalized).to.equal('2025.7.5.1.1');
  });

  it('should fallback to fallbackIncrement if increment fails', () => {
    const plugin = new CalverPlugin();
    plugin.setContext({
      increment: 'nonexistent',
      fallbackIncrement: 'minor',
      format: 'yyyy.mm.minor'
    });
    const version = '2025.7.5';
    const incrementedVersion = plugin.getIncrementedVersion({ latestVersion: version });
    expect(incrementedVersion).to.equal('2025.7.6');
  });

  it('should return latestVersion if both increment and fallbackIncrement fail', () => {
    const plugin = new CalverPlugin();
    plugin.setContext({
      increment: 'invalid',
      fallbackIncrement: 'also-invalid',
      format: 'yyyy.mm.minor'
    });
    const version = 'invalid.version';
    const result = plugin.getIncrementedVersion({ latestVersion: version });
    expect(result).to.equal(version);
  });

  it('should return undefined if latestVersion is undefined', () => {
    const plugin = new CalverPlugin();
    const result = plugin.getIncrementedVersion({});
    expect(result).to.equal(undefined);
  });

  it('should return the correct fallback when no context is provided', () => {
    const plugin = new CalverPlugin();
    expect(plugin.getFallbackInc()).to.equal('minor');
  });

  it('should return the correct format when no context is provided', () => {
    const plugin = new CalverPlugin();
    expect(plugin.getFormat()).to.equal('yy.mm.minor');
  });

  it('should return the correct increment when no context is provided', () => {
    const plugin = new CalverPlugin();
    expect(plugin.getInc()).to.equal('calendar');
  });
});
