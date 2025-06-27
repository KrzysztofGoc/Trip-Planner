export type IdleState = {
  mode: 'idle';
  range: { from: Date | null; to: Date | null };
  addingDate?: Date;
};
export type EditingState = {
  mode: 'editing';
  range: { from: Date | null; to: Date | null };
  draft: { from: Date; to: Date };
  addingDate?: Date;
};
export type RangeState = IdleState | EditingState;

export type RangeAction =
  | { type: 'RESET'; state: RangeState }
  | { type: 'START_EDIT'; range: { from: Date | null; to: Date | null } }
  | { type: 'UPDATE_FROM'; value: { hour: string; minute: string } }
  | { type: 'UPDATE_TO'; value: { hour: string; minute: string } }
  | { type: 'CANCEL' }
  | { type: 'SAVE' };

export function rangeReducer(state: RangeState, action: RangeAction): RangeState {
  switch (action.type) {
    case 'RESET':
      return { ...action.state };
    case 'START_EDIT': {
      let from = action.range.from;
      let to = action.range.to;
      if (!from || !to) {
        if (!state.addingDate) throw new Error("No addingDate for add mode");
        from = new Date(state.addingDate); from.setHours(1, 0, 0, 0);
        to = new Date(state.addingDate); to.setHours(2, 0, 0, 0);
      }
      return {
        mode: 'editing',
        range: state.range,
        draft: { from, to },
        addingDate: state.addingDate,
      };
    }
    case 'UPDATE_FROM': {
      if (state.mode !== 'editing') return state;
      const updatedFrom = new Date(state.draft.from);
      updatedFrom.setHours(Number(action.value.hour));
      updatedFrom.setMinutes(Number(action.value.minute));
      return { ...state, draft: { ...state.draft, from: updatedFrom } };
    }
    case 'UPDATE_TO': {
      if (state.mode !== 'editing') return state;
      const updatedTo = new Date(state.draft.to);
      updatedTo.setHours(Number(action.value.hour));
      updatedTo.setMinutes(Number(action.value.minute));
      return { ...state, draft: { ...state.draft, to: updatedTo } };
    }
    case 'CANCEL':
      if (state.mode !== 'editing') return state;
      return {
        mode: 'idle',
        range: state.range,
        addingDate: state.addingDate,
      };
    case 'SAVE':
      if (state.mode !== 'editing') return state;
      return {
        mode: 'idle',
        range: { from: state.draft.from, to: state.draft.to },
        addingDate: state.addingDate,
      };
    default:
      return state;
  }
}
