import React from "react";
import { memo, useCallback, useRef, useState } from 'react'
import { Platform , Text, View, Dimensions, } from "react-native";
import { AutocompleteDropdown} from 'react-native-autocomplete-dropdown';
import LOCATION_LIST from "../constants/locationList";

const LocationInput = memo(({onSelectItem}) => {
    
    const [loading, setLoading] = useState(false);
    const [Suggestions, setSuggestions] = useState([]);
    const [selected, setSelected] = useState(null);
    const dropdownController = useRef(null);

    const searchRef = useRef(null);

    const getSuggestions = useCallback(async q => {
        const filterToken = q.toLowerCase()
        if (typeof q !== 'string' || q.length < 2) {
          setSuggestions(null)
          return
        }
        setLoading(true)
        const location_dataset = LOCATION_LIST
        const suggestions = location_dataset
          .filter(item => item.title.toLowerCase().includes(filterToken))
          .map(item => ({
            id: item.id,
            title: item.title,
          }))
        setSuggestions(suggestions)
        setLoading(false)
      }, [])

      const onClearPress = useCallback(() => {
        setSuggestions(null)
        setSelected(null)
      }, [])


        const onItemSelect = useCallback(item => {
            setSelected(item)
            setSuggestions(null)
            onSelectItem(item)
        }, [])

    return (
        <View
        style={[
          { flex: 1, flexDirection: 'column', alignItems: 'center', width: '100%', marginVertical: 2, marginHorizontal: 5, },
          Platform.select({ ios: { zIndex: 1 } }),
        ]}>
        <AutocompleteDropdown
          ref={searchRef}
          controller={controller => {
            dropdownController.current = controller
          }}
          dataSet={Suggestions}
          onChangeText={getSuggestions}
          onSelectItem={onItemSelect}
          debounce={600}
          SuggestionsMaxHeight={Dimensions.get('window').height * 0.4}
          onClear={onClearPress}
          loading={loading}
          useFilter={false}
          textInputProps={{
            placeholder: 'Type Location',
            autoCorrect: false,
            autoCapitalize: 'none',
            style: {
              borderRadius: 25,
              backgroundColor: '#fff',
              color: 'black',
              paddingLeft: 18,
            },
          }}
          rightButtonsContainerStyle={{
            right: 8,
            height: 30,
            alignSelf: 'center',
          }}
          inputContainerStyle={{
            backgroundColor: '#fff',
            borderRadius: 5,
            width: '100%',
          }}
          SuggestionsContainerStyle={{
            backgroundColor: '#fff',
          }}
          containerStyle={{ flexGrow: 1, flexShrink: 1 }}
          inputHeight={40}
          showChevron={true}
          closeOnBlur={false}
          closeOnSubmit={false}
          clearOnFocus={false}
          EmptyResultComponent={<Text style={{ color: 'black', padding: 15 }}>No Result</Text>}
          onChevronPress={() => {
            dropdownController.current.toggle()
          }
        }
        />
      </View>
    )

});

export default LocationInput;
