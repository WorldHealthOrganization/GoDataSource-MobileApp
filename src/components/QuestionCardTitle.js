/**
 * Created by florinpopa on 04/03/2019.
 */
import React, {PureComponent} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import styles from './../styles';

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
                    minHeight: this.props.height,
                    paddingRight: this.props.paddingRight,
                    paddingLeft: this.props.paddingLeft,
                    paddingTop: this.props.paddingTopBottom,
                    paddingBottom: this.props.paddingTopBottom
                }]}>
                <View style={style.containerQuestionNumber}>
                    <Text style={style.questionText}>{this.props.questionNumber}</Text>
                </View>
                <Text style={[style.questionText, {
                    marginLeft: this.props.marginLeft,
                    marginRight: this.props.marginRight }]}
                >
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
        alignItems: 'center',
        backgroundColor: styles.backgroundColorRgb,
        flexDirection: 'row'
    },
    containerQuestionNumber: {
        alignItems: 'center',
        backgroundColor: styles.disabledColor,
        borderRadius: 25,
        height: 28,
        justifyContent: 'center',
        width: 28
    },
    questionText: {
        color: styles.textColor,
        fontFamily: 'Roboto-Medium',
        fontSize: 14
    }
});

export default QuestionCardTitle;