export const fadeInAnimation = {
    enter :{
        enabled:true,
        alpha: {
            from: 0,
            to: 1,
            duration: 300
        }
    },
    exit :{
        enabled:true,
        alpha: {
            from: 1,
            to: 0,
            duration: 300
        }
    }
};

export const fadeOutAnimation = {
    exit:{
        enabled:true,
        alpha: {
            from: 1,
            to: 0,
            duration: 300
        }
    },
    enter:{
        enabled:false,
        alpha: {
            from: 0,
            to: 1,
            duration: 300
        }
    }
}

export const slideInAnimation = {
    content: {
        translationX: {
            from: require('react-native').Dimensions.get('window').width,
            to: 0,
            duration: 300
        }
    }
}

export const slideOutAnimation = {
    content: {
        translationX: {
            from: 0,
            to: -require('react-native').Dimensions.get('window').width,
            duration: 300
        }
    }
}