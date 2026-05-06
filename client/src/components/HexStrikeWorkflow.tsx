/**
 * Legacy compatibility wrapper for the former HexStrike workflow route.
 * The active workflow now lives in the Pentest section.
 */

import AutomatedPentestPage from '@/pages/AutomatedPentestPage';

export const HexStrikeWorkflow = () => {
  return <AutomatedPentestPage />;
};

export default HexStrikeWorkflow;
