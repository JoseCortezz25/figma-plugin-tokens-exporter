import { Casing, Language, Model, Values } from "../../libs/types";

export enum ActionType {
  SET_SETTING_COLORS = 'SET_SETTING_COLORS',
  SET_LANGUAGE = 'SET_LANGUAGE',
  SET_CASING = 'SET_CASING',
  SET_MODEL = 'SET_MODEL',
  GET_SETTINGS_COLORS = 'GET_SETTINGS_COLORS',
}

type State = {
  values: Values;
};

type Action = {
  type: ActionType;
  values: {
    language?: Language,
    casing?: Casing,
    model?: Model,
  }
};

function reducerForm(state: State, action: Action): State {
  switch (action.type) {
    case ActionType.SET_CASING:
      return {
        values: {
          ...state.values,
          casing: action.values.casing
        }
      };

    case ActionType.SET_LANGUAGE:
      return {
        values: {
          ...state.values,
          language: action.values.language
        }
      };

    case ActionType.SET_MODEL:
      return {
        values: {
          ...state.values,
          model: action.values.model
        }
      };

    default:
      return state;
  }
}

export default reducerForm;