/**
 * Created by florinpopa on 04/03/2019.
 */
import React, {PureComponent} from 'react';
import {View, Text, StyleSheet, PixelRatio} from 'react-native';
import PropTypes from 'prop-types';
import styles from './../styles';
import translations from './../utils/translations'
import {getTranslation} from './../utils/functions';

// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box

class QuestionCardTitle extends PureComponent {
    constructor(props) {
        super(props)
    }

    render() {
        // console.log("Render QuestionCardTitle");
        return (
            <View style={[style.containerQuestion,
                {
                    height: this.props.height,
                    paddingRight: this.props.paddingRight,
                    paddingLeft: this.props.paddingLeft
                }]}>
                <View style={style.containerQuestionNumber}>
                    <Text style={style.questionText}>{this.props.questionNumber}</Text>
                </View>
                <Text style={[style.questionText, {
                    marginLeft: this.props.marginLeft,
                    marginRight: this.props.marginRight }]} numberOfLines={2}>
                    {this.props.questionText}
                    {this.props.questionCategory}
                </Text>
            </View>
        )
    }
}

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    containerQuestion: {
        flexDirection: 'row',
        backgroundColor: styles.colorBackgroundQuestions,
        alignItems: 'center'
    },
    containerQuestionNumber: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center'
    },
    questionText: {
        fontFamily: 'Roboto-Regular',
        fontSize: 13,
        color: 'black'
    }
});

// QuestionCardTitle.propTypes = {
//     label: PropTypes.string.isRequired,
//     hasBorderBottom: PropTypes.boolean,
//     borderBottomColor: PropTypes.string
// };
//
// QuestionCardTitle.defaultProps = {
//     label: 'Test',
//     hasBorderBottom: false,
//     borderBottomColor: styles.navigationDrawerSeparatorGrey
// };

export default QuestionCardTitle;