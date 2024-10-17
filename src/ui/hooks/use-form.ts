import { Casing, Languaje, Model } from "@ui/libs/types";

enum ActionType {
  SET_SETTING_COLORS = 'SET_SETTING_COLORS',
  SET_LANGUAGE = 'SET_LANGUAGE',
  SET_CASING = 'SET_CASING',
  SET_MODEL = 'SET_MODEL',
  GET_SETTINGS_COLORS = 'GET_SETTINGS_COLORS',
}

type Values = {
  languaje: Languaje;
  casing: Casing;
  model: Model;
};

type State = {
  values: Values;
};

type Action = {
  type: ActionType;
  values: Values;
};


function reducerForm(state: State, action: Action): State {
  switch (action.type) {
    case ActionType.SET_CASING:
      return {
        ...state,
        values: {
          ...state.values,
          casing: action.values.casing
        }
      };

    case ActionType.SET_LANGUAGE:
      return {
        ...state,
        values: {
          ...state.values,
          languaje: action.values.languaje
        }
      };

    case ActionType.SET_MODEL:
      return {
        ...state,
        values: {
          ...state.values,
          model: action.values.model
        }
      };

    case ActionType.SET_SETTING_COLORS:
      return {
        ...state,
        values: {
          ...state.values
        }
      };

    case ActionType.GET_SETTINGS_COLORS:
      return state;
    default:
      return state;
  }
}

export default reducerForm;